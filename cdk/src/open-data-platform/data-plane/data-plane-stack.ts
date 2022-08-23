// Defines the data plane.

import { Duration, Stack } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import { Construct } from 'constructs';
import { CommonProps } from '../../util';
import { Schema } from './schema/schema';
import { DataImportStack } from './data-import/data-import-stack';
import { DatabaseUserCredentials } from './db-user-credentials/db-user-credentials';
import { AuroraCapacityUnit } from 'aws-cdk-lib/aws-rds';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as sns from 'aws-cdk-lib/aws-sns';

interface DataPlaneProps extends CommonProps {
  vpc: ec2.IVpc;
}

export class DataPlaneStack extends Stack {
  readonly cluster: rds.ServerlessCluster;
  readonly databaseName: string;
  readonly tileserverCredentials: DatabaseUserCredentials;
  readonly apiLambdaRole: iam.Role;
  readonly notificationTopics: sns.ITopic[] = [];

  constructor(scope: Construct, id: string, props: DataPlaneProps) {
    super(scope, id, props);

    const { vpc } = props;

    // This uses Aurora Serverless, which supports the web-based Query Editor [1]. Therefore, engineers
    // can run queries on the privately-subnetted DB without the need to connect through a bastion VM.
    //
    // [1] https://us-east-2.console.aws.amazon.com/rds/home?region=us-east-2#query-editor:
    // Based on: https://github.com/aws/aws-cdk/blob/master/packages/%40aws-cdk/aws-rds/README.md#serverless.
    this.cluster = new rds.ServerlessCluster(this, 'MainCluster', {
      engine: rds.DatabaseClusterEngine.AURORA_POSTGRESQL,
      parameterGroup: rds.ParameterGroup.fromParameterGroupName(
        this,
        'ParameterGroup',
        'default.aurora-postgresql10',
      ),
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
      },
      enableDataApi: true, // Required to use Query Editor.
      scaling: { maxCapacity: AuroraCapacityUnit.ACU_4 },
    });

    this.cluster.addRotationSingleUser({
      automaticallyAfter: Duration.days(30),
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
      },
    });

    // default DB name.
    this.databaseName = 'postgres';

    // Credentials for the tile server to access the cluster.
    this.tileserverCredentials = new DatabaseUserCredentials(this, 'TileserverCredentials', {
      cluster: this.cluster,
      username: 'tileserver',
      databaseName: this.databaseName,
    });

    // Initialize the DB with linked SQL file.
    const rootSchema = new Schema(this, 'RootSchema', {
      cluster: this.cluster,
      vpc,
      db: this.databaseName,
      schemaFileName: 'schema.sql',
      credentialsSecret: this.cluster.secret!,
      userCredentials: [this.tileserverCredentials.credentialsSecret],
    });
    rootSchema.node.addDependency(this.tileserverCredentials.credentialsSecret);
    this.notificationTopics.push(...rootSchema.notificationTopics);

    new DataImportStack(this, 'DataImportStack', {
      cluster: this.cluster,
      vpc: vpc,
      db: this.databaseName,
      credentialsSecret: this.cluster.secret!,
    });

    // Create the role here so the Data plane does not depend on the App plane creating it.
    // The consequence is that each API lambda uses the same role.
    this.apiLambdaRole = new iam.Role(this, 'APILambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      // Pre-configured policies provided by AWS.
      // https://stackoverflow.com/questions/52636929/specifying-a-custom-role-for-lambda-with-the-aws-cdk
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
      description: 'Role used by each API lambda.',
    });
    this.cluster.grantDataApiAccess(this.apiLambdaRole);
  }
}

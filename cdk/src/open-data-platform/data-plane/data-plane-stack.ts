// Defines the data plane.

import { Duration, Stack } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsManager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { CommonProps } from '../../util';
import { Schema } from './schema';

interface DataPlaneProps extends CommonProps {
  vpc: ec2.IVpc;
}

export class DataPlaneStack extends Stack {
  readonly cluster: rds.ServerlessCluster;

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
    });

    this.cluster.addRotationSingleUser({
      automaticallyAfter: Duration.days(30),
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
      },
    });

    // Initialize the DB with linked SQL file.
    new Schema(this, 'RootSchema', {
      cluster: this.cluster,
      vpc,
      db: 'postgres', // default DB name.
      schemaFileName: 'schema.sql',
      credentialsSecret: this.cluster.secret!,
    });
  }
}
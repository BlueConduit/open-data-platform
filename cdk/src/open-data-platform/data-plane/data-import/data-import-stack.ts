import { Duration } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import * as path from 'path';
import { ResourceInitializer } from '../../../resource-initializer';

interface SchemaProps {
  cluster: rds.ServerlessCluster;
  vpc: ec2.IVpc;
  db: string;
  credentialsSecret: secretsmanager.ISecret;
}

export class DataImportStack extends Construct {
  constructor(scope: Construct, id: string, props: SchemaProps) {
    super(scope, id);

    const { cluster, vpc, db, credentialsSecret } = props;

    const writeDemographicDataFunction = new lambda.NodejsFunction(
      this,
      'write-demographic-data-handler',
      {
        entry: `${path.resolve(__dirname)}/write-demographic-data.handler.ts`,
        handler: 'handler',
        vpc: vpc,
        vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_NAT },
        environment: {
          CREDENTIALS_SECRET: credentialsSecret.secretArn,
          DATABASE_NAME: db,
        },
        timeout: Duration.minutes(5),
        bundling: {
          externalModules: ['aws-sdk'],
          nodeModules: ['csv-parser', '@databases/pg'],
        },
      },
    );

    const writeLeadPredictionFunction = new lambda.NodejsFunction(
      this,
      'write-lead-prediction-handler',
      {
        entry: `${path.resolve(__dirname)}/write-lead-prediction-handler.handler.ts`,
        handler: 'handler',
        vpc: vpc,
        vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_NAT },
        environment: {
          CREDENTIALS_SECRET: credentialsSecret.secretArn,
          DATABASE_NAME: db,
        },
        timeout: Duration.minutes(5),
        bundling: {
          externalModules: ['aws-sdk'],
          nodeModules: ['stream-json', '@databases/pg', 'stream-chain'],
        },
      },
    );

    // Allow reads to all S3 buckets in account.
    const s3GetObjectPolicy = new iam.PolicyStatement({
      actions: ['s3:GetObject'],
      resources: ['arn:aws:s3:::*'],
    });

    const getS3BucketsPolicy = new iam.Policy(this, 'get-buckets-policy', {
      statements: [s3GetObjectPolicy],
    });

    const lambda_functions: lambda.NodejsFunction[] = [
      writeDemographicDataFunction,
      writeLeadPredictionFunction,
    ];

    for (let f of lambda_functions) {
      credentialsSecret.grantRead(f);
      cluster.connections.allowFrom(f, ec2.Port.tcp(cluster.clusterEndpoint.port));

      f.role?.attachInlinePolicy(getS3BucketsPolicy);

      if (f.role?.roleArn != undefined) {
        let role = iam.Role.fromRoleArn(scope, id + '-' + f, f.role.roleArn);
        cluster.grantDataApiAccess(role);
      }
    }

    // Import the data on CDK deploy.
    // TODO: enable this once it is ready to use.
    if (false) {
      const init = new ResourceInitializer(this, 'ImportDemographicData', {
        initFunction: writeDemographicDataFunction,
      });
    }
  }
}

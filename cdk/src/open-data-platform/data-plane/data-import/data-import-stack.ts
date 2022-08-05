import { Duration } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as path from 'path';
import { dataImportLambdaFactory } from './utils/lambda-function-factory';
import { SchemaProps } from '../schema/schema-props';

export class DataImportStack extends Construct {
  constructor(scope: Construct, id: string, props: SchemaProps) {
    super(scope, id);

    const { cluster, vpc, db, credentialsSecret } = props;

    const writeViolationsDataFunction = new lambda.NodejsFunction(
      this,
      'write-violations-data-handler',
      {
        entry: `${path.resolve(__dirname)}/write-violations-data.handler.ts`,
        handler: 'handler',
        vpc: vpc,
        vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_NAT },
        environment: {
          CREDENTIALS_SECRET: credentialsSecret.secretArn,
          DATABASE_NAME: db,
        },
        memorySize: 512,
        timeout: Duration.minutes(15),
        bundling: {
          externalModules: ['aws-sdk'],
          nodeModules: ['stream-json', 'stream-chain', 'pg', 'pg-format', 'moment'],
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

    const lambdaFunctions: lambda.NodejsFunction[] = [
      dataImportLambdaFactory(this, props, 'write-demographic-data'),
      dataImportLambdaFactory(this, props, 'write-water-systems-data'),
      writeViolationsDataFunction,
      dataImportLambdaFactory(this, props, 'write-parcels-data'),
      dataImportLambdaFactory(this, props, 'write-county-data'),
      dataImportLambdaFactory(this, props, 'write-zipcode-data'),
      dataImportLambdaFactory(this, props, 'write-state-data'),
      dataImportLambdaFactory(this, props, 'write-aggregate-zip-demographic-data'),
    ];

    for (let f of lambdaFunctions) {
      credentialsSecret.grantRead(f);
      cluster.connections.allowFrom(f, ec2.Port.tcp(cluster.clusterEndpoint.port));

      f.role?.attachInlinePolicy(getS3BucketsPolicy);

      if (f.role?.roleArn != undefined) {
        let role = iam.Role.fromRoleArn(scope, id + '-' + f, f.role.roleArn);
        cluster.grantDataApiAccess(role);
      }
    }
  }
}

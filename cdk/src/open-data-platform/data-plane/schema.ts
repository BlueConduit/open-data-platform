import { Construct } from 'constructs';
// import { ResourceInitializer } from '~/lib/resource-initializer';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Duration } from 'aws-cdk-lib';
import * as path from 'path';

interface SchemaProps {
  cluster: rds.ServerlessCluster;
  vpc: ec2.IVpc;
  db: string;
  // Relative to this directory.
  schemaFileName: string;
  credentialsSecret: secretsmanager.ISecret;
  userCredentials?: secretsmanager.ISecret[];
}

export class Schema extends Construct {
  constructor(scope: Construct, id: string, props: SchemaProps) {
    super(scope, id);

    const { cluster, vpc, db, schemaFileName, credentialsSecret, userCredentials } = props;

    // This looks for a .ts file using the handler name to run as the lambda [1].
    // [1] https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-lambda-nodejs.NodejsFunction.html#entry
    const initSchemaFunction = new lambda.NodejsFunction(this, 'handler', {
      vpc: vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
      },
      environment: {
        CREDENTIALS_SECRET: credentialsSecret.secretArn,
        DATABASE_NAME: db,
      },
      timeout: Duration.minutes(5),
      // We may need to install a dependency at the root dir of this repo to make bundling work.
      // https://docs.aws.amazon.com/cdk/api/v1/docs/aws-lambda-nodejs-readme.html#local-bundling
      bundling: {
        nodeModules: ['@databases/pg'],
        commandHooks: {
          beforeBundling(inputDir: string, outputDir: string): string[] {
            return [
              `echo "Copying ${inputDir}/${schemaFileName} to ${outputDir}/schema.sql"`,
              `cp ${inputDir}/${path.relative(
                process.cwd(),
                __dirname,
              )}/${schemaFileName} ${outputDir}/schema.sql`,
            ];
          },
          afterBundling() {
            return [];
          },
          beforeInstall() {
            return [];
          },
        },
      },
    });

    credentialsSecret.grantRead(initSchemaFunction);
    userCredentials?.forEach((secret) => secret.grantRead(initSchemaFunction));

    cluster.connections.allowFrom(initSchemaFunction, ec2.Port.tcp(cluster.clusterEndpoint.port));

    // const init = new ResourceInitializer(this, 'InitSchema', {
    //   initFunction: initSchemaFunction,
    //   payload: {
    //     userCredentials: userCredentials?.map((secret) => secret.secretArn),
    //   },
    // });
    // init.node.addDependency(cluster);
  }
}

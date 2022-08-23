// Defines a custom resource that updates DB schema.
//
// Based on https://github.com/BlueConduit/tributary/blob/main/cdk/lib/data-plane/schema.ts

import { Duration } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { FilterPattern } from 'aws-cdk-lib/aws-logs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as actions from 'aws-cdk-lib/aws-cloudwatch-actions';
import { Construct } from 'constructs';
import * as path from 'path';
import { ResourceInitializer } from '../../../resource-initializer';
import { lambdaErrorAlarm } from '../../../util';
import { ITopic } from 'aws-cdk-lib/aws-sns';
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions';

interface SchemaProps {
  cluster: rds.ServerlessCluster;
  vpc: ec2.IVpc;
  db: string;
  schemaFileName: string; // This can be a path relative to this directory.
  credentialsSecret: secretsmanager.ISecret;
  userCredentials?: secretsmanager.ISecret[];
  ticketSNSTopic?: ITopic;
}

// NodejsFunction looks for a .ts file using the handler ID to use as the lambda code [1].
// [1] https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-lambda-nodejs.NodejsFunction.html#entry
const handlerId = 'handler';

// This construct works by defining a lambda that connects to the DB and executes the provided SQL.
export class Schema extends Construct {
  readonly notificationTopics: sns.ITopic[] = [];

  constructor(scope: Construct, id: string, props: SchemaProps) {
    super(scope, id);

    const { cluster, vpc, db, schemaFileName, credentialsSecret, userCredentials, ticketSNSTopic } =
      props;

    const initSchemaFunction = new NodejsFunction(this, handlerId, {
      description: `Updates the DB schema for the "${db}" database in "${cluster.clusterIdentifier}".`,
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

    // Set up access control for the lambda.
    credentialsSecret.grantRead(initSchemaFunction);
    userCredentials?.forEach((secret) => secret.grantRead(initSchemaFunction));
    cluster.connections.allowFrom(initSchemaFunction, ec2.Port.tcp(cluster.clusterEndpoint.port));

    // Invoke the lambda.
    const init = new ResourceInitializer(this, 'InitSchemaResouce', {
      initFunction: initSchemaFunction,
      payload: {
        userCredentials: userCredentials?.map((secret) => secret.secretArn),
      },
    });
    init.node.addDependency(cluster);

    // Monitor errors.
    const alarm = lambdaErrorAlarm(this, initSchemaFunction, 'Init Schema');
    if (ticketSNSTopic) alarm.addAlarmAction(new SnsAction(ticketSNSTopic));
  }
}

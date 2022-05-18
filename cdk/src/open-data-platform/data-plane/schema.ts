// Defines a custom resource that updates DB schema.
//
// Based on https://github.com/BlueConduit/tributary/blob/main/cdk/lib/data-plane/schema.ts

import { Duration } from 'aws-cdk-lib';
import * as cr from 'aws-cdk-lib/custom-resources';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import * as path from 'path';

interface SchemaProps {
  cluster: rds.ServerlessCluster;
  vpc: ec2.IVpc;
  db: string;
  schemaFileName: string; // This can be a path relative to this directory.
  credentialsSecret: secretsmanager.ISecret;
  userCredentials?: secretsmanager.ISecret[];
}

// NodejsFunction looks for a .ts file using the handler ID to use as the lambda code [1].
// [1] https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-lambda-nodejs.NodejsFunction.html#entry
const handlerId = 'handler';

// This construct works by defining a lambda that connects to the DB and executes the provided SQL.
export class Schema extends Construct {
  constructor(scope: Construct, id: string, props: SchemaProps) {
    super(scope, id);

    const { cluster, vpc, db, schemaFileName, credentialsSecret, userCredentials } = props;

    const initSchemaFunction = new NodejsFunction(this, handlerId, {
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
    const init = new ResourceInitializer(this, 'InitSchema', {
      initFunction: initSchemaFunction,
      payload: {
        userCredentials: userCredentials?.map((secret) => secret.secretArn),
      },
    });
    init.node.addDependency(cluster);
  }
}

// Construct that invokes a lambda one time during `cdk deploy`.
// If there are other lambdas that we want to invoke during deployment, consider breaking this
// out into a common file.
//
// Based on: https://github.com/BlueConduit/tributary/blob/main/cdk/lib/resource-initializer.ts
interface ResourceInitializerProps {
  initFunction: lambda.Function;
  payload?: object;
}

class ResourceInitializer extends Construct {
  constructor(scope: Construct, id: string, props: ResourceInitializerProps) {
    super(scope, id);

    const { initFunction, payload } = props;

    const defaultPayload = {
      source: 'customresource.init',
    };

    const apiCall: cr.AwsSdkCall = {
      service: 'Lambda',
      action: 'invoke',
      parameters: {
        FunctionName: initFunction.functionName,
        Payload: JSON.stringify(payload ?? defaultPayload),
      },
      physicalResourceId: cr.PhysicalResourceId.of(initFunction.currentVersion.version),
    };

    const init = new cr.AwsCustomResource(this, 'CustomResource', {
      onCreate: apiCall,
      onUpdate: apiCall,
      policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
        resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE,
      }),
    });
    init.node.addDependency(initFunction);
    initFunction.grantInvoke(init);
  }
}

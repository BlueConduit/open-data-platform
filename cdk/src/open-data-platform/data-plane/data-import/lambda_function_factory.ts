import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as path from 'path';

import { Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SchemaProps } from './data-import-stack';

export const lambdaFactory = (
  scope: Construct,
  props: SchemaProps,
  id: string,
): lambda.NodejsFunction => {
  return new lambda.NodejsFunction(scope, `${id}-handler`, {
    entry: `${path.resolve(__dirname)}/${id}.handler.ts`,
    handler: 'handler',
    vpc: props.vpc,
    vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_NAT },
    environment: {
      CREDENTIALS_SECRET: props.credentialsSecret.secretArn,
      DATABASE_NAME: props.db,
      RESOURCE_ARN: props.cluster.clusterArn,
    },
    memorySize: 512,
    timeout: Duration.minutes(15),
    bundling: {
      externalModules: ['aws-sdk'],
      nodeModules: ['stream-json', 'stream-chain'],
    },
  });
};

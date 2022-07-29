import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as path from 'path';

import { Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SchemaProps } from '../../schema/schema-props';
import { cwd } from 'process';

/**
 * Produces a lambda function that requires db access to import data.
 * @param scope: the construct under which to provision resource.
 * @param props: schema identifiers passed to the function when writing data.
 * @param id: ID to assign resource.
 */
export const dataImportLambdaFactory = (
  scope: Construct,
  props: SchemaProps,
  id: string,
): lambda.NodejsFunction => {
  return new lambda.NodejsFunction(scope, `${id}-handler`, {
    entry: `${path.resolve(__dirname)}/../${id}.handler.ts`,
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

/**
 * Produces a lambda function that requires db access to import data.
 * @param scope: the construct under which to provision resource.
 * @param props: schema identifiers passed to the function when writing data.
 * @param id: ID to assign resource.
 */
export const apiLambdaFactory = (
  scope: Construct,
  props: SchemaProps,
  id: string,
): lambda.NodejsFunction =>
  new lambda.NodejsFunction(scope, `${id}-handler`, {
    entry: `${cwd()}/../api/src/${id}/get.handler.ts`,
    handler: 'handler',
    vpc: props.vpc,
    vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_NAT },
    environment: {
      CREDENTIALS_SECRET: props.credentialsSecret.secretArn,
      DATABASE_NAME: props.db,
      RESOURCE_ARN: props.cluster.clusterArn,
    },
    bundling: {
      externalModules: ['aws-sdk'],
    },
  });

import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

import { Construct } from 'constructs';
import { cwd } from 'process';
import { SchemaProps } from '../../data-plane/schema/schema-props';

/**
 * Produces a lambda function that requires db access to import data.
 * @param scope: the construct under which to provision resource.
 * @param props: schema identifiers passed to the function when reading data.
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
      nodeModules: ['moment'],
    },
  });

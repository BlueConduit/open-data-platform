import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

import { Construct } from 'constructs';
import { cwd } from 'process';
import { SchemaProps } from '../../data-plane/schema/schema-props';
import { FunctionUrlAuthType } from 'aws-cdk-lib/aws-lambda';
import { Cors } from 'aws-cdk-lib/aws-apigateway';
import { IRole } from 'aws-cdk-lib/aws-iam';

export interface apiLambda {
  lambda: lambda.NodejsFunction;
  path: string;
  url: string;
}

export interface apiLambdaProps extends SchemaProps {
  role: IRole;
}

/**
 * Produces a lambda function that requires db access to import data.
 * @param scope: the construct under which to provision resource.
 * @param props: schema identifiers passed to the function when reading data.
 * @param id: ID to assign resource.
 */
export const apiLambdaFactory = (
  scope: Construct,
  props: apiLambdaProps,
  id: string,
): apiLambda => {
  const f = new lambda.NodejsFunction(scope, `${id}-handler`, {
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
    role: props.role,
  });
  props.credentialsSecret.grantRead(f);
  return {
    lambda: f,
    // Assumes that there is some URL parameter after the path.
    path: `/${id}/*`,
    // This might be better handled in the frontend stack, which can lock down auth and CORS.
    url: f.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
      // TODO: limit to blueconduit.com.
      cors: { allowedOrigins: Cors.ALL_ORIGINS },
    }).url,
  };
};

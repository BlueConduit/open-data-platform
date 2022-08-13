import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

import { Construct } from 'constructs';
import { cwd } from 'process';
import { SchemaProps } from '../../data-plane/schema/schema-props';
import { IRole } from 'aws-cdk-lib/aws-iam';

export interface apiLambdaProps extends SchemaProps {
  role: IRole;
  gateway: apigateway.RestApi;
}

/**
 * Produces a lambda function that requires db access to import data.
 * @param scope: the construct under which to provision resource.
 * @param props: schema identifiers passed to the function when reading data.
 * @param id: ID to assign resource.
 * @param method: HTTP method.
 * @param path: URL path to the handler. e.g. "/resource/{id}".
 */
export const apiLambdaFactory = (
  scope: Construct,
  props: apiLambdaProps,
  id: string,
  method: string,
  path: string,
): void => {
  // Create lambda.
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
  // Grant DB access.
  props.credentialsSecret.grantRead(f);
  // Add to API gateway.
  if (path[0] === '/') path = path.substring(1); // Remove prefix slash for a cleaner split.
  const resources = path.split('/');
  const endpoint = resources.reduce<apigateway.IResource>(
    (prev: apigateway.IResource, cur: string) => prev.addResource(cur),
    props.gateway.root,
  );
  endpoint.addMethod(method, new apigateway.LambdaIntegration(f, { proxy: true }));
};

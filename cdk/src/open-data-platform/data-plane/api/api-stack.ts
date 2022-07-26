import { Duration } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { SchemaProps } from '../schema/schema-props';
import * as path from 'path';
import { cwd } from 'process';

export class ApiStack extends Construct {
  constructor(scope: Construct, id: string, props: SchemaProps) {
    super(scope, id);

    const { cluster, vpc, db, credentialsSecret } = props;

    const lambdaFunction = new lambda.NodejsFunction(this, 'geolocate-handler', {
      //entry: `${path.resolve(__dirname + '/../../../../../')}/api/src/geolocate/get.handler.ts`,
      entry: `${cwd()}/../api/src/geolocate/get.handler.ts`,
      handler: 'handler',
      vpc: vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_NAT },
      environment: {
        CREDENTIALS_SECRET: credentialsSecret.secretArn,
        DATABASE_NAME: db,
        RESOURCE_ARN: props.cluster.clusterArn,
      },
      memorySize: 512,
      timeout: Duration.minutes(15),
      bundling: {
        externalModules: ['aws-sdk'],
        nodeModules: [],
      },
    });

    credentialsSecret.grantRead(lambdaFunction);
    cluster.connections.allowFrom(lambdaFunction, ec2.Port.tcp(cluster.clusterEndpoint.port));

    if (lambdaFunction.role?.roleArn != undefined) {
      let role = iam.Role.fromRoleArn(
        scope,
        id + '-' + lambdaFunction,
        lambdaFunction.role.roleArn,
      );
      cluster.grantDataApiAccess(role);
    }

    const api = new apigateway.RestApi(this, 'open-data-platform-api', {
      description: 'Open data platform for BlueConduit',
      deployOptions: {
        stageName: 'dev',
      },

      // Enable CORS
      defaultCorsPreflightOptions: {
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key'],
        allowMethods: ['GET,OPTIONS'],
        allowCredentials: true,
        allowOrigins: ['*'],
      },
    });

    const geolocate = api.root.addResource('geolocate');
    const latlong = geolocate.addResource('{latlong+}');
    latlong.addMethod('GET', new apigateway.LambdaIntegration(lambdaFunction, { proxy: true }));
  }
}

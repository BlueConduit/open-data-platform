import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { SchemaProps } from '../schema/schema-props';
import { apiLambdaFactory } from '../data-import/utils/lambda-function-factory';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';

export class ApiStack extends Construct {
  constructor(scope: Construct, id: string, props: SchemaProps) {
    super(scope, id);

    const { cluster, credentialsSecret } = props;

    const geolocateHandler = apiLambdaFactory(this, props, 'geolocate');
    const parcelHandler = apiLambdaFactory(this, props, 'parcel');
    const waterSystemHandler = apiLambdaFactory(this, props, 'watersystem');
    const zipCodeScorecardHandler = apiLambdaFactory(this, props, 'zipcode/scorecard');

    const lambdaFunctions: lambda.NodejsFunction[] = [
      geolocateHandler,
      parcelHandler,
      waterSystemHandler,
      zipCodeScorecardHandler,
    ];

    for (let f of lambdaFunctions) {
      credentialsSecret.grantRead(f);
      cluster.connections.allowFrom(f, ec2.Port.tcp(cluster.clusterEndpoint.port));

      if (f.role?.roleArn != undefined) {
        let role = iam.Role.fromRoleArn(scope, id + '-' + f, f.role.roleArn);
        cluster.grantDataApiAccess(role);
      }
    }

    const api = new apigateway.RestApi(this, `${id}-open-data-platform-api`, {
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
    latlong.addMethod('GET', new apigateway.LambdaIntegration(geolocateHandler, { proxy: true }));

    const waterSystem = api.root.addResource('watersystem');
    const getWaterSystemById = waterSystem.addResource('{pws_id+}');
    getWaterSystemById.addMethod(
      'GET',
      new apigateway.LambdaIntegration(waterSystemHandler, { proxy: true }),
    );

    const parcels = api.root.addResource('parcel');
    // TODO: consider standardized addresses here instead of lat,long
    const parcelById = parcels.addResource('{latlong+}');
    parcelById.addMethod('GET', new apigateway.LambdaIntegration(parcelHandler, { proxy: true }));

    const zipCode = api.root.addResource('zipcode');
    const scorecard = zipCode.addResource('scorecard');
    const scorecardById = scorecard.addResource('{zip_code+}');
    scorecardById.addMethod(
      'GET',
      new apigateway.LambdaIntegration(zipCodeScorecardHandler, { proxy: true }),
    );
  }
}

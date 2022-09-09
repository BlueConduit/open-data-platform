import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { ITopic } from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';
import prefixes from '../../frontend/url-prefixes';
import { AppPlaneStackProps } from '../app-plane-stack';
import { ApiMonitoring } from './api-monitoring';
import { apiLambdaFactory } from './lambda-function-factory';

interface ApiStackProps extends AppPlaneStackProps {
  ticketSNSTopic?: ITopic;
}

export class ApiStack extends Construct {
  readonly gateway: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id);

    const { dataPlaneStack, networkStack, ticketSNSTopic } = props;

    this.gateway = new apigateway.RestApi(this, 'API', {
      // TODO: Lock this down for non-sandbox environments.
      defaultCorsPreflightOptions: {
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key'],
        allowMethods: ['GET,OPTIONS'],
        allowCredentials: true,
        allowOrigins: ['*'],
      },
      deployOptions: {
        stageName: prefixes.api,
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        tracingEnabled: true,
        dataTraceEnabled: true,
      },
    });

    const apiLambdaProps = {
      cluster: dataPlaneStack.cluster,
      vpc: networkStack.vpc,
      db: dataPlaneStack.databaseName,
      credentialsSecret: dataPlaneStack.cluster.secret!,
      role: dataPlaneStack.apiLambdaRole,
      gateway: this.gateway,
    };

    // GET /geolocate/{latlong+}
    apiLambdaFactory(this, apiLambdaProps, 'geolocate', 'GET', '/geolocate/{latlong+}');
    apiLambdaFactory(this, apiLambdaProps, 'watersystem', 'GET', '/watersystem/{pws_id+}');
    apiLambdaFactory(this, apiLambdaProps, 'parcel', 'GET', '/parcel/{latlong+}');
    apiLambdaFactory(
      this,
      apiLambdaProps,
      'zipcode/scorecard',
      'GET',
      '/zipcode/scorecard/{zipcode+}',
    );

    new ApiMonitoring(this, 'APIMonitoring', { gateway: this.gateway, ticketSNSTopic });
  }
}

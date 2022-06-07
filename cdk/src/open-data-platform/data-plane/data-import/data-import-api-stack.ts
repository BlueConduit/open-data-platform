import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';

/**
 * Provisions API for data imports.
 *
 * Supports lambda integrations in order to invoke functions through its
 * endpoints.
 */
export class DataImportApiStack extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);
  }

  api = new apigateway.RestApi(this, 'open-data-platform-v1', {
    restApiName: 'Open Data Platform Service',
    description: 'Loads available data sources into the database',
    defaultCorsPreflightOptions: {
      allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key'],
      allowMethods: ['GET'],
      allowCredentials: true,
      allowOrigins: ['*'],
    },
  });

  /**
   * Adds a lambda integration to the REST api. The endpoint will invoke its
   * corresponding lambda
   * @param endPoint: API endpoint or resource
   * @param lambdaFunction: function to invoke with /GET request to the endpoint
   */
  addLambdaIntegration(endPoint: string, lambdaFunction: lambda.IFunction): void {
    const lambdaIntegration = new apigateway.LambdaIntegration(lambdaFunction, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
    });

    const endpoint = this.api.root.addResource(endPoint);
    endpoint.addMethod('GET', lambdaIntegration);
  }
}

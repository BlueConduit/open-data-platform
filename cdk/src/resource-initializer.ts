import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cr from 'aws-cdk-lib/custom-resources';

interface ResourceInitializerProps {
  initFunction: lambda.Function;
  payload?: object;
}

// Construct that invokes a lambda one time during `cdk deploy`.
// If there are other lambdas that we want to invoke during deployment, consider breaking this
// out into a common file.
//
// Based on: https://github.com/BlueConduit/tributary/blob/main/cdk/lib/resource-initializer.ts
export class ResourceInitializer extends Construct {
  constructor(scope: Construct, id: string, props: ResourceInitializerProps) {
    super(scope, id);

    const { initFunction, payload } = props;

    // In the absence of a provided payload, let the lambda know what triggered it.
    const defaultPayload = {
      source: 'customresource.InitSchemaInvocation',
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

    // Invoke the lambda on creation or update of this "resource".
    const init = new cr.AwsCustomResource(this, 'InitSchemaInvocation', {
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

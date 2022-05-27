import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as util from '../util';
import { DataPlaneStack } from './data-plane/data-plane-stack';
import { NetworkStack } from './network/network-stack';
import { FrontendStack } from './frontend/frontend-stack';

export class OpenDataPlatformStack extends Stack {
  constructor(scope: Construct, id: string, props?: util.CommonProps) {
    super(scope, id, props);

    const networkStack = new NetworkStack(scope, util.stackName(util.StackId.Network), {
      ...props,
    });
    const dataPlaneStack = new DataPlaneStack(scope, util.stackName(util.StackId.DataPlane), {
      ...props,
      vpc: networkStack.vpc,
    });
    const frontendStack = new FrontendStack(scope, util.stackName(util.StackId.Frontend), {
      ...props,
    });
  }
}

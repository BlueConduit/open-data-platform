// Defines the root of the application. This initializes each of the stacks.

import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as util from '../util';
import { DataPlaneStack } from './data-plane/data-plane-stack';
import { NetworkStack } from './network/network-stack';
import { FrontendStack } from './frontend/frontend-stack';
import { AppPlaneStack } from './app-plane/app-plane-stack';

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
    const appPlaneStack = new AppPlaneStack(scope, util.stackName(util.StackId.AppPlane), {
      ...props,
      dataPlaneStack,
      networkStack,
    });
    const frontendStack = new FrontendStack(scope, util.stackName(util.StackId.Frontend), {
      ...props,
    });
  }
}

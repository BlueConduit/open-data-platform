// Defines the root of the application. This initializes each of the stacks.

import { Construct } from 'constructs';
import * as util from '../util';
import { DataPlaneStack } from './data-plane/data-plane-stack';
import { NetworkStack } from './network/network-stack';
import { FrontendStack } from './frontend/frontend-stack';
import { AppPlaneStack } from './app-plane/app-plane-stack';

/**
 * Creates the constituent stacks for the platform.
 * @param scope - Parent CDK app that these stacks as a part of.
 * @param props - App-wide props passed down to stacks.
 */
export default (scope: Construct, props?: util.CommonProps) => {
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
    appPlaneStack,
  });
};

// Defines the root of the application. This initializes each of the stacks.

import { Construct } from 'constructs';
import { CommonProps, stackName, StackId } from '../util';
import { DataPlaneStack } from './data-plane/data-plane-stack';
import { NetworkStack } from './network/network-stack';
import { FrontendStack } from './frontend/frontend-stack';
import { AppPlaneStack } from './app-plane/app-plane-stack';
import { topicArn } from '../monitoring/monitoring-stack';

/**
 * Creates the constituent stacks for the platform.
 * @param scope - Parent CDK app that these stacks as a part of.
 * @param props - App-wide props passed down to stacks.
 */
export default (scope: Construct, props: CommonProps) => {
  const { envType, env } = props;
  if (env) props.ticketSNSTopicArn = topicArn(envType, env);
  const networkStack = new NetworkStack(scope, stackName(StackId.Network, envType), {
    ...props,
  });
  const dataPlaneStack = new DataPlaneStack(scope, stackName(StackId.DataPlane, envType), {
    ...props,
    vpc: networkStack.vpc,
  });
  const appPlaneStack = new AppPlaneStack(scope, stackName(StackId.AppPlane, envType), {
    ...props,
    dataPlaneStack,
    networkStack,
  });
  const frontendStack = new FrontendStack(scope, stackName(StackId.Frontend, envType), {
    ...props,
    appPlaneStack,
    networkStack,
  });
  frontendStack.addDependency(appPlaneStack);
};

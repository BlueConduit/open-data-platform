import { Stack, StackProps } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { CommonProps } from '../types';
import { DataPlaneStack } from './data-plane-stack';
import { NetworkStack } from './network-stack';

export class OpenDataPlatformStack extends Stack {
  constructor(scope: Construct, id: string, props?: CommonProps) {
    super(scope, id, props);

    const networkStack = new NetworkStack(scope, 'Network', { ...props });
    const dataPlaneStack = new DataPlaneStack(scope, 'DataPlane', {
      ...props,
      vpc: networkStack.vpc,
    });
  }
}

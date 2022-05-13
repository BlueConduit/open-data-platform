import { Stack, StackProps } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import * as util from '../util';
import { DataPlaneStack } from './data-plane-stack';
import { NetworkStack } from './network-stack';

export class OpenDataPlatformStack extends Stack {
  constructor(scope: Construct, id: string, props?: util.CommonProps) {
    super(scope, id, props);

    const annotatedProps = {
      tags: {
        Project: util.projectName,
      },
    };

    const networkStack = new NetworkStack(scope, util.stackName(util.StackId.Network), {
      ...props,
    });
    const dataPlaneStack = new DataPlaneStack(scope, util.stackName(util.StackId.DataPlane), {
      ...props,
      vpc: networkStack.vpc,
    });
  }
}

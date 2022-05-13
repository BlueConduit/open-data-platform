// Defines the network.

import { Stack } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { CommonProps } from '../types';

export class NetworkStack extends Stack {
  readonly vpc: ec2.Vpc;

  constructor(scope: Construct, id: string, props: CommonProps) {
    super(scope, id, props);

    this.vpc = new ec2.Vpc(this, 'VPC', {
      cidr: '10.0.0.0/16',
      maxAzs: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 20,
          name: 'private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
        },
      ],
    });
  }
}

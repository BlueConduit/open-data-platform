// Defines the network.

import { Stack } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import { Construct } from 'constructs';
import { CommonProps, EnvType } from '../../util';
import { Dns } from './dns';

export class NetworkStack extends Stack {
  readonly vpc: ec2.IVpc;
  readonly cluster: ecs.Cluster;
  readonly dns: Dns;

  constructor(scope: Construct, id: string, props: CommonProps) {
    super(scope, id, props);

    this.vpc = new ec2.Vpc(this, 'VPC', {
      cidr: '10.0.0.0/16',
      maxAzs: 2,
      natGateways: props.envType !== EnvType.Production ? 1 : undefined,
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

    // Set up an ECS shared cluster for other stacks to add services to.
    this.cluster = new ecs.Cluster(this, 'Cluster', {
      vpc: this.vpc,
      enableFargateCapacityProviders: true,
    });

    this.dns = new Dns(this, 'DNS', props);
  }
}

// Defines the network.

import { Stack } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import { Construct } from 'constructs';
import { CommonProps, projectName, EnvType } from '../../util';

export class NetworkStack extends Stack {
  readonly vpc: ec2.IVpc;
  readonly cluster: ecs.Cluster;

  constructor(scope: Construct, id: string, props: CommonProps) {
    super(scope, id, props);

    // This is currently set to always use a new VPC, since we don't yet have a good way to
    // determine whether to use a new or existing one (and can't dynamically figure that out [1]).
    // [1] https://github.com/aws/aws-cdk/issues/5305#issuecomment-565394725
    this.vpc = [EnvType.Development, EnvType.Sandbox].includes(props.envType)
      ? // Use an existing VPC.
        // By default, an AWS account can only have 5 Elastic IP addresses. Reusing existing VPCs keeps
        // that number down.
        ec2.Vpc.fromLookup(this, id, {
          // tags: {
          //   Project: projectName,
          // },

          // Temporarily hardcode the ID since the tag lookup was not finding the right VPC.
          // TODO: replace with search by tag.
          vpcId: 'vpc-03af3621549e79f22',
          region: 'us-east2', // The lookup was
        })
      : // Else, create a new VPC.
        // Note that changes here will not be reflected on deployment if a VPC already exists.
        // TODO: document how to make a change to an existing VPC.
        new ec2.Vpc(this, 'VPC', {
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

    // Set up an ECS shared cluster for other stacks to add services to.
    this.cluster = new ecs.Cluster(this, 'Cluster', {
      vpc: this.vpc,
      enableFargateCapacityProviders: true,
    });
  }
}

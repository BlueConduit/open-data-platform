import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import { Construct } from 'constructs';

export class OpenDataPlatformStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // This is all one file right now while we initialize the stack.
    // TODO(fellows): break the stack into separate files, similar to https://github.com/BlueConduit/tributary/tree/main/cdk.

    // Set up networking.
    const vpc = new ec2.Vpc(this, 'VPC', {
      cidr: "10.0.0.0/16",
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
        {
          cidrMask: 24,
          name: 'isolated',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    // Set up data plane.
    const cluster = new rds.DatabaseCluster(this, 'Cluster', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({ version: rds.AuroraPostgresEngineVersion.VER_13_4 }),
      instanceProps: {
        vpc: vpc,
        vpcSubnets: {
          // TODO: make PRIVATE_ISOLATED once we have things running.
          subnetType: ec2.SubnetType.PUBLIC,
        },
      },
      storageEncrypted: true,
    });

    cluster.addRotationSingleUser({
      automaticallyAfter: Duration.days(30),
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_NAT
      }
    })

  }
}

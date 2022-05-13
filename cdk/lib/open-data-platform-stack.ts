import { CfnOutput, Duration, Fn, Stack, StackProps } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as cloud9 from 'aws-cdk-lib/aws-cloud9';
import { Construct } from 'constructs';
import { CfnDBSubnetGroup } from 'aws-cdk-lib/aws-rds';

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
    const clusterSubnets = new CfnDBSubnetGroup(this, 'AuroraSubnetGroup', {
      dbSubnetGroupDescription: 'Subnet group to access aurora',
      dbSubnetGroupName: 'aurora-serverless-subnet-group',
      subnetIds: vpc.privateSubnets.map(s => s.subnetId),
    });
    const serverlessCluster = new rds.CfnDBCluster(this, 'serverlessCluster', {
      dbClusterIdentifier: `main-aurora-serverless-cluster`,
      engineMode: 'serverless',
      engine: 'aurora-postgresql',
      engineVersion: '10.18',
      enableHttpEndpoint: true,
      databaseName: 'main',
      dbSubnetGroupName: clusterSubnets.ref,
      masterUsername: 'adminuser',
      masterUserPassword: 'blueconduit', // TODO: GENERATE THIS!
      // backupRetentionPeriod: 1,
      // finalSnapshotIdentifier: `main-aurora-serverless-snapshot`,
      // scalingConfiguration: {
      //   autoPause: true,
      //   maxCapacity: 4,
      //   minCapacity: 2,
      //   secondsUntilAutoPause: 3600,
      // }
    });
  }
}

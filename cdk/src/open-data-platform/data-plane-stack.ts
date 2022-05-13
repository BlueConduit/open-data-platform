// Defines the data plane.
//
// This uses Aurora Serverless, which supports the web-based Query Editor [1]. Therefore, engineers
// can run queries on the privately-subnetted DB without the need to connect through a bastion VM.
//
// [1] https://us-east-2.console.aws.amazon.com/rds/home?region=us-east-2#query-editor:

import { Stack } from 'aws-cdk-lib';
import { ISubnet } from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import { Construct } from 'constructs';
import { CommonProps } from '../types';

export class DataPlaneStack extends Stack {
  constructor(scope: Construct, id: string, props: CommonProps) {
    super(scope, id, props);

    const { vpc } = props;

    const clusterSubnets = new rds.CfnDBSubnetGroup(this, 'AuroraSubnetGroup', {
      dbSubnetGroupDescription: 'Subnet group to access aurora',
      dbSubnetGroupName: 'aurora-serverless-subnet-group',
      subnetIds: vpc.privateSubnets.map((s: ISubnet): string => s.subnetId),
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

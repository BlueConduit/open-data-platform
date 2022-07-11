// Defines the tile server, which users will request to get vector map data.

import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';

interface TileServerProps {
  ecsCluster: ecs.Cluster;
  postgisTileDatabase: rds.ServerlessCluster;
  databaseUrlSecret: secretsmanager.ISecret;
}

export class TileServer extends Construct {
  readonly ecsService: ecsPatterns.ApplicationLoadBalancedFargateService;

  constructor(scope: Construct, id: string, props: TileServerProps) {
    super(scope, id);

    const { ecsCluster, postgisTileDatabase, databaseUrlSecret } = props;

    // Use Fargate, which runs the container in a serverless way.
    // TODO: consider using spot instances for lower cost: https://github.com/aws/aws-cdk/blob/master/design/aws-ecs/aws-ecs-fargate-capacity-providers.md
    this.ecsService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'Service', {
      cluster: ecsCluster,
      taskSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
      },
      // Resource quantities are copied from https://github.com/BlueConduit/tributary/blob/main/cdk/lib/app-plane/tileserver.ts
      // TODO: adjust based on usage.
      desiredCount: 1,
      memoryLimitMiB: 1024,
      cpu: 4096, // measured in milliCPU; or 0.5 vCPU.
      taskImageOptions: {
        // Source: https://github.com/urbica/martin
        // TODO: Rename this reposity or tag to describe that it's the tile server, not the platform.
        image: ecs.ContainerImage.fromRegistry('public.ecr.aws/m2w9u0k4/open-data-platform:latest'),
        containerPort: 3000,
        secrets: {
          // This includes the credentials, host, and database name.
          DATABASE_URL: ecs.Secret.fromSecretsManager(databaseUrlSecret),
        },
      },
      // Open the load balancer to internet, so this can be accessed directly.
      publicLoadBalancer: true,
    });

    this.ecsService.targetGroup.configureHealthCheck({
      path: '/healthz',
      enabled: true,
    });

    this.ecsService.service.connections.allowTo(
      postgisTileDatabase,
      ec2.Port.tcp(postgisTileDatabase.clusterEndpoint.port),
    );

    const scalableTarget = this.ecsService.service.autoScaleTaskCount({
      minCapacity: 1,
      maxCapacity: 5,
    });

    scalableTarget.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 50,
    });

    scalableTarget.scaleOnMemoryUtilization('MemoryScaling', {
      targetUtilizationPercent: 50,
    });
  }
}

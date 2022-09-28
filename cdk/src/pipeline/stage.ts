import { Stage } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { MonitoringProps, MonitoringStack } from '../monitoring/monitoring-stack';
import OpenDataPlatform from '../open-data-platform/open-data-platform';
import * as util from '../util';

export class OpenDataPlatformStage extends Stage {
  constructor(scope: Construct, id: string, props: util.CommonProps) {
    super(scope, id);
    OpenDataPlatform(this, props);
  }
}

export class MonitoringStage extends Stage {
  constructor(scope: Construct, id: string, props: MonitoringProps) {
    super(scope, id);
    new MonitoringStack(this, util.stackName(util.StackId.Monitoring, props.envType), props);
  }
}

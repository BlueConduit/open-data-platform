import { Stage } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { OpenDataPlatformStack } from '../open-data-platform/root-stack';
import * as util from '../util';

export class OpenDataPlatformStage extends Stage {
  constructor(scope: Construct, id: string, props: util.CommonProps) {
    super(scope, id);
    new OpenDataPlatformStack(this, util.stackName(util.StackId.Root, props.envType), props);
  }
}

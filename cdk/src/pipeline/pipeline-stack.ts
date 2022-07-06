// Create a pipeline that deployes to a general "dev" instance. We'll use that for "prod" until we
// have access to another account.

import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as pipelines from 'aws-cdk-lib/pipelines';
import * as util from '../util';
import { OpenDataPlatformStage } from './stage';

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
      pipelineName: util.projectName,
      crossAccountKeys: true,
      selfMutation: true,
      dockerEnabledForSynth: true,
      synth: new pipelines.ShellStep('Synth', {
        input: pipelines.CodePipelineSource.connection('BlueConduit/open-data-platform', 'main', {
          connectionArn:
            'arn:aws:codestar-connections:us-east-2:223904267317:connection/cf8a731a-3a36-4e74-ac7f-d93604fd258e',
        }),
        commands: [
          // Update npm.
          'npm i -g npm',

          // Build the client.
          'npm --prefix client ci',
          'npm --prefix client run build',

          // Synthesize the CDK app.
          'npm --prefix run cdk ci',
          'npm --prefix run cdk pipeline-synth',
        ],
        primaryOutputDirectory: 'cdk/cdk.out',
      }),
    });

    pipeline.addStage(
      new OpenDataPlatformStage(scope, 'Development', {
        env: { account: '036999211278', region: 'us-east-2' },
        tags: { Project: util.projectName, Environment: util.EnvType.Development },
        envType: util.EnvType.Development,
      }),
    );
  }
}

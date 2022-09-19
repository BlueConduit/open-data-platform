// Create a pipeline that deployes to a general "dev" instance. We'll use that for "prod" until we
// have access to another account.

import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as pipelines from 'aws-cdk-lib/pipelines';
import * as util from '../util';
import { MonitoringStage, OpenDataPlatformStage } from './stage';
import { BuildSpec, LinuxBuildImage } from 'aws-cdk-lib/aws-codebuild';

const PROD_BAKE_DURATION_SECS = 24 * 60 * 60; // 1 day.
const PROD_RELEASE_TIME = '09:00'; // 9 am local (Eastern) time.
const CODE_REPO = 'BlueConduit/open-data-platform';
const CODE_CONNECTION_ARN =
  'arn:aws:codestar-connections:us-east-2:223904267317:connection/cf8a731a-3a36-4e74-ac7f-d93604fd258e';

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
      pipelineName: util.projectName,
      crossAccountKeys: true,
      selfMutation: true,
      dockerEnabledForSynth: true,
      synth: new pipelines.ShellStep('Synth', {
        input: pipelines.CodePipelineSource.connection(CODE_REPO, 'main', {
          connectionArn: CODE_CONNECTION_ARN,
        }),
        commands: [
          // Update npm.
          'npm i -g npm',

          // Build the client.
          'npm --prefix client ci',
          'npm --prefix client run build',

          // Synthesize the CDK app.
          'npm --prefix cdk ci',
          'npm --prefix cdk run pipeline-synth',
        ],
        primaryOutputDirectory: 'cdk/cdk.out',
      }),
      synthCodeBuildDefaults: {
        buildEnvironment: {
          // TODO: update to a build image which supports node 16 on next CDK release
          buildImage: LinuxBuildImage.STANDARD_5_0,
        },
        partialBuildSpec: BuildSpec.fromObject({
          phases: {
            install: {
              'runtime-versions': {
                // TODO: update to node 16 once new codebuild images are available in next CDK release
                nodejs: 14,
              },
            },
          },
        }),
      },
    });

    // Monitor this release pipeline itself.
    pipeline.addStage(
      new MonitoringStage(this, 'Deployments-Monitoring', {
        ...props,
        envType: util.EnvType.Deployments,
        slackConfig: {
          slackChannelConfigurationName: `${util.EnvType.Deployments}-${util.projectName}-channel-config`,
          slackWorkspaceId: 'TJTFN34NM',
          // #leadout-deployment-notifications
          slackChannelId: 'C0406KX4DPC',
        },
      }),
    );

    pipeline.addStage(
      new MonitoringStage(this, 'Dev-Monitoring', {
        env: { account: '036999211278', region: 'us-east-2' },
        tags: { Project: util.projectName, Environment: util.EnvType.Development },
        envType: util.EnvType.Development,
        slackConfig: {
          slackChannelConfigurationName: `${util.EnvType.Development}-${util.projectName}-channel-config`,
          slackWorkspaceId: 'TJTFN34NM',
          // #leadout-dev-notifications
          slackChannelId: 'C03UFKFAK9C',
        },
      }),
    );

    pipeline.addStage(
      new OpenDataPlatformStage(this, 'Dev', {
        env: { account: '036999211278', region: 'us-east-2' },
        tags: { Project: util.projectName, Environment: util.EnvType.Development },
        envType: util.EnvType.Development,
      }),
    );

    pipeline.addStage(
      new MonitoringStage(this, 'Prod-Monitoring', {
        env: { account: '530942487205', region: 'us-east-2' },
        tags: { Project: util.projectName, Environment: util.EnvType.Production },
        envType: util.EnvType.Production,
        slackConfig: {
          slackChannelConfigurationName: `${util.EnvType.Production}-${util.projectName}-channel-config`,
          slackWorkspaceId: 'TJTFN34NM',
          // #leadout-prod-notifications
          slackChannelId: 'C0426AYGBV3',
        },
      }),
    );

    /* TODO: Consider splitting prod out into its own pipeline.
     *
     * The prod deployment runs on a different schedule than dev [1]. We chose to use one pipeline
     * for both environments for implementation/ops simplicity. However, this doesn't actually
     * implement a "nightly" release since multiple prod releases could happen within a given day.
     *
     * [1] https://docs.google.com/document/d/1zZxCoXx5JzLXTOGVdvC4s8H-r82DFjfmNU-dmFPAQVI/edit#heading=h.bsmnc9iehgn
     */
    pipeline.addStage(
      new OpenDataPlatformStage(this, 'Prod', {
        env: { account: '530942487205', region: 'us-east-2' },
        tags: { Project: util.projectName, Environment: util.EnvType.Production },
        envType: util.EnvType.Production,
      }),
      {
        // Bake the release in dev before deploying to prod, to catch any problems early.
        pre: [
          new pipelines.ShellStep('BakeStep', {
            commands: [
              // Bake a minimum of this duration.
              `sleep ${PROD_BAKE_DURATION_SECS}`,
              // Then wait until a specific (local) time on a weekday, to limit release to once/day.
              `while [ $(date +%H:%M) != "${PROD_RELEASE_TIME}" -o $(date +%u) -gt 5 ]; do sleep 1; done`,
            ],
          }),
        ],
      },
    );
  }
}

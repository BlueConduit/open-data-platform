// Create a pipeline that deployes to a general "dev" instance. We'll use that for "prod" until we
// have access to another account.

import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as pipelines from 'aws-cdk-lib/pipelines';
import * as util from '../util';
import { MonitoringStage, OpenDataPlatformStage } from './stage';
import { BuildSpec, LinuxBuildImage } from 'aws-cdk-lib/aws-codebuild';

const DEV_BAKE_DURATION_SECS = 20 * 60; // 20 minutes, so ensure the canary runs at least once.
const PROD_BAKE_DURATION_HOURS = 12;
const PROD_RELEASE_TIME = '09:00'; // 9 am local (Eastern) time.
const CODE_REPO = 'BlueConduit/open-data-platform';
const CODE_CONNECTION_ARN =
  'arn:aws:codestar-connections:us-east-2:223904267317:connection/cf8a731a-3a36-4e74-ac7f-d93604fd258e';
// Then check there are no open alarms for dev. This ignores alarms named with
// "TargetTracking" because those are automatically created by AWS for auto-scaling,
// which shouldn't affect the release.
const CHECK_DEV_ALARMS_SCRIPT =
  "if [[ $( aws cloudwatch describe-alarms --query 'MetricAlarms[?contains(AlarmName, `" +
  `Dev-${util.projectName}` +
  "`) == `true` && StateValue!=`OK` && !contains(AlarmName, `TargetTracking`)]' --output text) ]]; then exit 1; fi";

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
      // This must have a unique name from the `Dev` stage. It also must end in `Dev` so stacks have
      // a similar name to other Dev stacks.
      new MonitoringStage(this, 'Monitoring-Dev', {
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
      {
        // Bake the release in dev before deploying to prod, to catch any problems early.
        post: [
          new pipelines.ShellStep('BakeStep', {
            commands: [
              // Bake a minimum of this duration before calling the stage a success.
              `sleep ${DEV_BAKE_DURATION_SECS}`,
              CHECK_DEV_ALARMS_SCRIPT,
            ],
          }),
        ],
      },
    );

    pipeline.addStage(
      new MonitoringStage(this, 'Monitoring-Prod', {
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
    const bakeAndCheckAlarms = [];
    for (let i = 0; i < PROD_BAKE_DURATION_HOURS; i++) {
      bakeAndCheckAlarms.push(
        `sleep ${60 * 60}`, // 1 hour.
        CHECK_DEV_ALARMS_SCRIPT, // Check for alarms every hour.
      );
    }
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
              ...bakeAndCheckAlarms,
              // Then wait until a specific (local) time on a weekday, to limit updating to once/day
              // And to avoid updating out of business hours.
              `while [ $(date +%H:%M) != "${PROD_RELEASE_TIME}" -o $(date +%u) -gt 5 ]; do sleep 1; done`,
              // Finally check for alarms before updating.
              CHECK_DEV_ALARMS_SCRIPT,
            ],
          }),
        ],
      },
    );
  }
}

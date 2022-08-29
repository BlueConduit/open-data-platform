// Create a pipeline that deployes to a general "dev" instance. We'll use that for "prod" until we
// have access to another account.

import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as pipelines from 'aws-cdk-lib/pipelines';
import * as util from '../util';
import { MonitoringStage, OpenDataPlatformStage } from './stage';
import { BuildSpec, LinuxBuildImage } from 'aws-cdk-lib/aws-codebuild';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { env } from 'process';
import { topicArn } from '../monitoring/monitoring-stack';
import { DetailType, NotificationRule } from 'aws-cdk-lib/aws-codestarnotifications';

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

    // Add monitoring.
    // This will fail if the monitoring stage has not yet completed.
    const ticketSNSTopic = Topic.fromTopicArn(
      this,
      'ticketSNSTopic',
      topicArn(util.EnvType.Deployments, env),
    );

    new NotificationRule(this, 'FailureNotification', {
      detailType: DetailType.BASIC,
      // These are events that stop the pipeline, except in the 'superseded' case where another
      // execution took precedence.
      events: [
        'codepipeline-pipeline-pipeline-execution-failed',
        'codepipeline-pipeline-pipeline-execution-canceled',
      ],
      source: pipeline.pipeline,
      targets: [ticketSNSTopic],
    });
  }
}

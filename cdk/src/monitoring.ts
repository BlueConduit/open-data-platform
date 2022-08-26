// CDK entry point for the monitoring stack.
// This is intialized separately, since there can only be one Slack connection per channel per account.

import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MonitoringStack } from './monitoring/monitoring-stack';
import { stackName, StackId, defaultEnv, projectName } from './util';

const app = new cdk.App();

// TODO: Add this to the deployment pipeline.
new MonitoringStack(app, StackId.Monitoring, {
  // Development account.
  env: { account: '036999211278', region: 'us-east-2' },
  tags: { Project: projectName, Environment: defaultEnv },
  envType: defaultEnv,
  slackConfig: {
    slackChannelConfigurationName: `${defaultEnv}-${projectName}-channel-config`,
    slackWorkspaceId: 'TJTFN34NM',
    slackChannelId: 'C03V1FX7KC1',
  },
});

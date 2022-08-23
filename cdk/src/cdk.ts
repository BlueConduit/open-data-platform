#!/usr/bin/env node

// CDK entry point for the application.

import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import OpenDataPlatform from './open-data-platform/open-data-platform';
import * as util from './util';

const app = new cdk.App();

OpenDataPlatform(app, {
  // Development account.
  env: { account: '036999211278', region: 'us-east-2' },
  tags: { Project: util.projectName, Environment: util.defaultEnv },
  envType: util.defaultEnv,
  slackConfig: {
    slackChannelConfigurationName: 'LeadOut-sandbox',
    slackWorkspaceId: 'TJTFN34NM',
    slackChannelId: 'C03V1FX7KC1',
  },
});

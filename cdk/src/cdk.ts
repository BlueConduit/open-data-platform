#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { OpenDataPlatformStack } from './open-data-platform/root-stack';
import * as util from './util';

const app = new cdk.App();

new OpenDataPlatformStack(app, util.stackName(util.StackId.Root), {
  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */

  // Development account.
  env: { account: '036999211278', region: 'us-east-2' },

  tags: { Project: util.projectName, Environment: util.getEnv() },
});

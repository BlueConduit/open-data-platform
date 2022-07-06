#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import OpenDataPlatform from './open-data-platform/open-data-platform';
import * as util from './util';

const app = new cdk.App();

OpenDataPlatform(app, {
  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */

  // Development account.
  // TODO: replace with AWSGoogleSandbox account.
  env: { account: '036999211278', region: 'us-east-2' },

  tags: { Project: util.projectName },
});

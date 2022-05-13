#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { OpenDataPlatformStack } from './open-data-platform/root-stack';

const topLevelId = 'OpenDataPlatform';
const app = new cdk.App();

// This is just a simple naming scheme while we initialize the stack.
// TODO: standardize the construct naming scheme.
new OpenDataPlatformStack(app, `${process.env.USER}${topLevelId}`, {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  // Development account.
  // TODO: replace with AWSGoogleSandbox account.
  env: { account: '036999211278', region: 'us-east-2' },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});

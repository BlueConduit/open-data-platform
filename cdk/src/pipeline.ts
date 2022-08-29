#!/usr/bin/env node

// CDK entry point for the pipeline.

import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as util from './util';
import { PipelineStack } from './pipeline/pipeline-stack';

const app = new cdk.App();

new PipelineStack(app, `${util.projectName}Pipeline`, {
  // Deployments account.
  env: { account: '223904267317', region: 'us-east-2' },
  tags: { Project: util.projectName, Environment: util.EnvType.Deployments },
});

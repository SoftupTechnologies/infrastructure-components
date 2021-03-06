#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { ServerlessInfrastructureCdkStack } from '../lib/serverless-infrastructure-cdk-stack';
import { Envs } from '../types/envs'

const app = new cdk.App();
new ServerlessInfrastructureCdkStack(app, 'Test', {
  projectName: 'serverless-infrastructure',
  clientName: 'test-client',
  env: Envs.DEV,
  region: 'eu-central-1',
});

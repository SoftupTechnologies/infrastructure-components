#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { ServerlessInfrastructureCdkStack, Envs } from '../lib/serverless-infrastructure-cdk-stack';

const app = new cdk.App();
new ServerlessInfrastructureCdkStack(app, 'ServerlessInfrastructureCdkStack', {
  projectName: 'serverless-infrastructure',
  clientName: 'test-client',
  env: Envs.DEV,
});

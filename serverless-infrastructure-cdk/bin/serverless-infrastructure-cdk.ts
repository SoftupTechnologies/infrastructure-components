#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { ServerlessInfrastructureCdkStack } from '../lib/serverless-infrastructure-cdk-stack';

const app = new cdk.App();
new ServerlessInfrastructureCdkStack(app, 'ServerlessInfrastructureCdkStack');

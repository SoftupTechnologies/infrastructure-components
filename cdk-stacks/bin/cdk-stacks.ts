#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { ArtifactsBucketStack } from '../lib/artifacts-bucket'

const app = new cdk.App();
new ArtifactsBucketStack(app, 'ArtifactsBucketStack');

app.synth();

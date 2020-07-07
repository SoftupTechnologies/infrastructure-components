import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';

import { ArtifactsBucket } from './artifacts-bucket';
import { MyVpc } from './vpc';
import { BastionHostServices } from './bastion-host';
import { ClientAppInfrastructure } from './clientapp-bucket';
import { RdsInfrastructure } from './rds';
import { Envs } from '../types/envs';
import { cfnTagToCloudFormation } from '@aws-cdk/core';
import { UserPoolService } from './cogntio-user-pool';
import { ParameterStore } from './parameter-store';

interface StackProps {
  projectName: string,
  clientName: string,
  region: string,
  env: Envs,
}

export class ServerlessInfrastructureCdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: StackProps) {
    super(scope, id);
  }
}
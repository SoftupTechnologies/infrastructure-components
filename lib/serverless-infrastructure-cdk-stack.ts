import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';

import { ArtifactsBucket } from './artifacts-bucket';
import { MyVpc } from './vpc';
import { BastionHostServices } from './bastion-host';
import { ClientAppInfrastructure } from './clientapp-bucket';
import { RdsInfrastructure } from './rds';
import { Envs } from '../types/envs';
import { cfnTagToCloudFormation } from '@aws-cdk/core';
import { UserPoolService } from './cognito-user-pool';
import { ParameterStore } from './parameter-store';
import { AsgStackWithAlb } from './autoscaling-group';

interface StackProps {
  projectName: string,
  clientName: string,
  region: string,
  env: Envs,
}

export class ServerlessInfrastructureCdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: StackProps) {
    super(scope, id);

    const { vpc } = new MyVpc(this, 'MyAwesomeVpc', {
      vpcCidr: '10.0.0.0/16',
      publicSubnetsNo: 1,
      maxAzs: 2,
      privateSubnetsNo: 1,
    });

    const { asg, alb } = new AsgStackWithAlb(this, 'MyAsg', {
      ...props,
      vpc,
    });

    asg.scaleOnCpuUtilization('CpuUtilScaling', {
      targetUtilizationPercent: 60,
      cooldown: cdk.Duration.hours(2),
      disableScaleIn: false,
    });

    new cdk.CfnOutput(this, 'AlbDns', {
      exportName: 'AlbDns',
      value: alb.loadBalancerDnsName,
    });
  }
}
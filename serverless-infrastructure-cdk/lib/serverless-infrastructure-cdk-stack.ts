import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';

import { ArtifactsBucket } from './artifacts-bucket';
import { MyVpc } from './vpc';
import { BastionHostServices } from './bastion-host';
import { ClientAppInfrastructure } from './clientapp-bucket';

export enum Envs {
  DEV = 'dev',
  STAGE = 'stage',
  PROD = 'prod',
}

interface StackProps {
  projectName: string,
  clientName: string,
  env: Envs,
}

export class ServerlessInfrastructureCdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: StackProps) {
    super(scope, id);

    // new ArtifactsBucket(this, `ArtifactsBucket-${props.env}`, {
    //   artifactBucketName: `${props.projectName}-artifacts-bucket-${props.clientName}-${props.env}`,
    //   tags: [
    //     {
    //       key: 'cost-center',
    //       value: props.clientName,
    //     },
    //     {
    //       key: 'project',
    //       value: props.projectName,
    //     }
    //   ]
    // });

    // const myVpc = new MyVpc(this, `MyVpc-${props.env}`, {
    //   vpcCidr: '10.0.0.0/16',
    //   publicSubnetProps: [
    //     {
    //       cidr: '10.0.5.0/24',
    //       az: 'eu-central-1a',
    //       mapPublicIpOnLaunch: true,
    //       withNatGateway: true,
    //       withBastionHost: true,
    //     }
    //   ],
    //   privateSubnetProps: [
    //     {
    //       cidr: '10.0.6.0/24',
    //       az: 'eu-central-1a',
    //     }
    //   ],
    //   tags: [
    //     {
    //       key: 'cost-center',
    //       value: props.clientName,
    //     },
    //     {
    //       key: 'project',
    //       value: props.projectName,
    //     }
    //   ]
    // });

    const caInfrastructure = new ClientAppInfrastructure(this, 'ClientAppInfrastructure', {
      clientAppBucketName: `${props.projectName}-client-app-bucket-${props.clientName}-${props.env}`,
    });

    // new cdk.CfnOutput(this, 'VpcId', {
    //   exportName: 'VpcId',
    //   value: myVpc.vpc.vpcId,
    // });

    new cdk.CfnOutput(this, 'ClientAppDomain', {
      exportName: 'ClientAppDomain',
      value: caInfrastructure.clientAppCfDomainName,
    });

    new cdk.CfnOutput(this, 'ClientAppDistributionId', {
      exportName: 'ClientAppDistributionId',
      value: caInfrastructure.clientAppDistributionId,
    })
  }
}
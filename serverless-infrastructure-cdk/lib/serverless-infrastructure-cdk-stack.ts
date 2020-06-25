import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';

import { ArtifactsBucket } from './artifacts-bucket';
import { MyVpc } from './vpc';
import { BastionHostServices } from './bastion-host';
import { ClientAppInfrastructure } from './clientapp-bucket';
import { RdsInfrastructure } from './rds';
import { Envs } from '../types/envs';

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

    const myVpc = new MyVpc(this, `MyVpc-${props.env}`, {
      vpcCidr: '10.0.0.0/16',
      publicSubnetProps: [
        {
          cidr: '10.0.5.0/24',
          az: 'eu-central-1a',
          mapPublicIpOnLaunch: true,
          withBastionHost: true,
        }
      ],
      // privateSubnetProps: [
      //   {
      //     cidr: '10.0.6.0/24',
      //     az: 'eu-central-1a',
      //   }
      // ],
      tags: [
        {
          key: 'cost-center',
          value: props.clientName,
        },
        {
          key: 'project',
          value: props.projectName,
        }
      ]
    });

    // const caInfrastructure = new ClientAppInfrastructure(this, 'ClientAppInfrastructure', {
    //   clientAppBucketName: `${props.projectName}-client-app-bucket-${props.clientName}-${props.env}`,
    // });

    // const database = new RdsInfrastructure(this, 'Rds', {
    //   ...props,
    //   dbMasterUserName: 'mydbMasterUser',
    //   vpc: myVpc.vpc,
    //   databaseName: 'mydb',
    //   cidrForIngressTraffic: '10.0.5.0/24',
    // });

    new BastionHostServices(this, 'BastionHostServices', {
      ...props,
      instanceName: 'test-bh',
      vpc: myVpc.vpc,
      subnets: myVpc.subnetsForBastionHost,
    });

    new cdk.CfnOutput(this, 'VpcId', {
      exportName: 'VpcId',
      value: myVpc.vpc.vpcId,
    });
  }
}
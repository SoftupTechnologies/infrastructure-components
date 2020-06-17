import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';

import { ArtifactsBucket } from './artifacts-bucket';
import { MyVpc } from './vpc';

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

    new ArtifactsBucket(this, 'ArtifactsBucket', {
      artifactBucketName: `${props.projectName}-artifacts-bucket-${props.clientName}-${props.env}`,
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

    new MyVpc(this, `MyVpc`, {
      vpcCidr: '10.0.0.0/16',
      publicSubnetProps: [
        {
          cidr: '10.0.5.0/24',
          az: 'eu-central-1a',
          mapPublicIpOnLaunch: true,
          withNatGateway: true,
        }
      ],
      privateSubnetProps: [
        {
          cidr: '10.0.6.0/24',
          az: 'eu-central-1a',
        }
      ],
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
  }
}
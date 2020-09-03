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
      publicSubnetsNo: 2,
      maxAzs: 2,
      privateSubnetsNo: 1,
    });

    const bastionHost = new BastionHostServices(this, 'BastionHost', {
      ...props,
      vpc,
      subnets: [vpc.publicSubnets[0]],
      instanceName: 'my-instance',
      keyName: 'my-instance-key.pem',
    });

    const db = new RdsInfrastructure(this, 'MyCoolDbService', {
      ...props,
      dbMasterUserName: 'coolUsername',
      vpc,
      databaseName: 'coolDatabase',
      dbAllocatedStorage: 10,
      dbBackupRetention: 30,
      dbSubnets: vpc.privateSubnets,
      ingressSgs: [bastionHost.bastionHostSecurityGroup]
    });

    const artifactsBucket = new ArtifactsBucket(this, 'ArtifactStorage', {
      artifactBucketName: 'artifact-bucket',
      tags: [{
        key: 'Name',
        value: 'Service Artifacts'
      }]
    });

    const clientApp = new ClientAppInfrastructure(this, 'ClientApp', {
      clientAppBucketName: 'web-app-1'
    });

    const userPool = new UserPoolService(this, 'UserPool', {
      ...props,
    });

    const stackProps = new ParameterStore(this, 'SomeDataInSSMPS', {
      parameterName: 'StackProps',
      value: {
        ...props,
      }
    });
  }
}
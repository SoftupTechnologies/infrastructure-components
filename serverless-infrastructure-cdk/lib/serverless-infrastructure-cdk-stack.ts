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

    new ArtifactsBucket(this, `ArtifactsBucket-${props.env}`, {
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

    const myVpc = new MyVpc(this, `MyVpc-${props.env}`, {
      vpcCidr: '10.0.0.0/16',
      maxAzs: 2,
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

    const caInfrastructure = new ClientAppInfrastructure(this, 'ClientAppInfrastructure', {
      clientAppBucketName: `${props.projectName}-client-app-bucket-${props.clientName}-${props.env}`,
    });

    const rdsIngressSg = new ec2.SecurityGroup(this, 'RdsIngressSg', {
      vpc: myVpc.vpc,
      securityGroupName: `${props.projectName}-rds-ingress`,
    });

    rdsIngressSg.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(5432),
    )

    const database = new RdsInfrastructure(this, 'Rds', {
      ...props,
      dbMasterUserName: 'mydbMasterUser',
      vpc: myVpc.vpc,
      databaseName: 'mydb',
      cidrForIngressTraffic: '10.0.0.0/16',
      dbSubnets: myVpc.vpc.publicSubnets,
      ingressSgs: [rdsIngressSg],
    });

    new cdk.CfnOutput(this, 'VpcId', {
      exportName: 'VpcId',
      value: myVpc.vpc.vpcId,
    });

    new cdk.CfnOutput(this, 'RdsSubnetIds', {
      exportName: 'RdsSubnetIds',
      value: myVpc.vpc.publicSubnets.map(sub => sub.subnetId).join(','),
    });

    new cdk.CfnOutput(this, 'RdsEndpoint', {
      exportName: 'RdsEndpoint',
      value: database.instance.dbInstanceEndpointAddress,
    });

    new cdk.CfnOutput(this, 'RdsEndpointPort', {
      exportName: 'RdsEndpointPort',
      value: database.instance.dbInstanceEndpointPort,
    });
  }
}
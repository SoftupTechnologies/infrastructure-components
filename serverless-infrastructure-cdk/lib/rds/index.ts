import * as cdk from '@aws-cdk/core';
import * as rds from '@aws-cdk/aws-rds';
import * as ec2 from '@aws-cdk/aws-ec2';
import { Envs } from '../../types/envs';

export interface RdsInfrastructureProps {
  projectName: string,
  env: Envs,
  clientName: string,
  dbMasterUserName: string,
  vpc: ec2.Vpc,
  databaseName: string,
  cidrForIngressTraffic: string,
}

export class RdsInfrastructure extends cdk.Construct {
  public readonly instance: rds.DatabaseInstance;

  constructor(scope: cdk.Construct, id: string, props: RdsInfrastructureProps) {
    super(scope, id);

    // const rdsSg = new ec2.SecurityGroup(this, 'RdsSg', {

    // });

    const instance = new rds.DatabaseInstance(this, 'RdsDbInstance', {
      engine: rds.DatabaseInstanceEngine.POSTGRES,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      masterUsername: `${props.projectName}-${props.dbMasterUserName}-${props.env}`,
      vpc: props.vpc,
      databaseName: props.databaseName,
    });

    instance.connections.allowFrom(ec2.Peer.ipv4(props.cidrForIngressTraffic), ec2.Port.tcp(5439));

    this.instance = instance;
  }
}
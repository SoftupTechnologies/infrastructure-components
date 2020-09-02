import * as cdk from '@aws-cdk/core';
import * as rds from '@aws-cdk/aws-rds';
import * as ec2 from '@aws-cdk/aws-ec2';
import { Envs } from '../../types/envs';

export interface RdsInfrastructureProps {
  projectName: string,
  env: Envs,
  clientName: string,
  dbMasterUserName: string,
  dbMasterUserPassword?: string,
  vpc: ec2.Vpc,
  databaseName: string,
  ingressSgs?: ec2.SecurityGroup[],
  dbPort?: number,
  dbSubnets?: ec2.ISubnet[],
  publicAccessible?: boolean,
  dbEngine?: rds.IInstanceEngine,
  dbInstanceType?: ec2.InstanceType,
  dbAllocatedStorage?: number,
  dbBackupRetention?: number,
}

export class RdsInfrastructure extends cdk.Construct {
  public readonly instance: rds.DatabaseInstance;

  constructor(scope: cdk.Construct, id: string, props: RdsInfrastructureProps) {
    super(scope, id);

    const defaultEngine = rds.DatabaseInstanceEngine.POSTGRES;
    const defaultPort = 5432;

    const vpcPlacement: any = {};

    if (props.publicAccessible) {
      vpcPlacement.subnetType = ec2.SubnetType.PUBLIC;
    } else if (props.dbSubnets) {
      vpcPlacement.subnets = props.dbSubnets;
    }

    const defaultSg = new ec2.SecurityGroup(this, 'DefaultSgForVpcAddresses', {
      vpc: props.vpc,
      securityGroupName: 'Connections from vpc',
    });

    defaultSg.addIngressRule(
      ec2.Peer.ipv4(props.vpc.vpcCidrBlock),
      ec2.Port.tcp(props.dbPort || defaultPort),
    );

    const ingressSgs = props.ingressSgs || [];

    this.instance = new rds.DatabaseInstance(this, 'RdsDbInstance', {
      engine: props.dbEngine || defaultEngine,
      instanceType: props.dbInstanceType || ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      masterUsername: props.dbMasterUserName,
      masterUserPassword: props.dbMasterUserPassword ? new cdk.SecretValue(props.dbMasterUserPassword) : undefined,
      vpc: props.vpc,
      databaseName: props.databaseName,
      instanceIdentifier: `${props.projectName}-db-instance-${props.env}`,
      allocatedStorage: props.dbAllocatedStorage || (props.env === Envs.PROD ? 20 : 5),
      port: props.dbPort || defaultPort,
      backupRetention: props.dbBackupRetention ? cdk.Duration.days(props.dbBackupRetention) : cdk.Duration.days(10),
      vpcPlacement: Object.keys(vpcPlacement).length ? vpcPlacement : undefined,
      deletionProtection: props.env === Envs.PROD ? true : false,
      securityGroups: [defaultSg, ...ingressSgs],
    });
  }
}
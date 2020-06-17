import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';

export interface BastionHostServicesProps {
  subnets: ec2.Subnet[];
  vpc: ec2.Vpc;
  instanceName: string;
  instanceType: ec2.InstanceType;
};

export class BastionHostServices extends cdk.Construct {
  public readonly bastionHostInstance: ec2.BastionHostLinux;

  constructor(scope: cdk.Construct, id: string, props: BastionHostServicesProps) {
    super(scope, id);

    const bastionHost = new ec2.BastionHostLinux(this, 'BastionHostInstance', {
      vpc: props.vpc,
      subnetSelection: {
        subnets: props.subnets,
      },
      instanceName: props.instanceName,
      instanceType: props.instanceType,
    });

    this.bastionHostInstance = bastionHost;
  }
}
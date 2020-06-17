import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import { Tags } from './../types/tags';
import { SubnetProps } from './../types/subnets';

export interface VpcProps {
  vpcCidr: string;
  publicSubnetProps: SubnetProps[];
  privateSubnetProps: SubnetProps[];
  tags: Tags;
}

export class MyVpc extends cdk.Construct {
  public readonly privateSubnets: ec2.PrivateSubnet[] = [];
  public readonly publicSubnets: ec2.PublicSubnet[] = [];

  constructor(scope: cdk.Construct, id: string, props: VpcProps) {
    super(scope, id);

    const vpc = new ec2.Vpc(this, 'MyVpc', {
      cidr: props.vpcCidr,
    });

    const { privateSubnetProps, publicSubnetProps } = props;

    privateSubnetProps.forEach((privSubProps, i) => {
      this.privateSubnets.push(
        new ec2.PrivateSubnet(this, `MyPrivateSubnet${i}`, {
          cidrBlock: privSubProps.cidr,
          vpcId: vpc.vpcId,
          availabilityZone: privSubProps.az,
          mapPublicIpOnLaunch: !!privSubProps.mapPublicIpOnLaunch
        })
      )
    });

    publicSubnetProps.forEach((pubSubProps, i) => {
      this.publicSubnets.push(
        new ec2.PublicSubnet(this, `MyPublicSubnet${i}`, {
          cidrBlock: pubSubProps.cidr,
          vpcId: vpc.vpcId,
          availabilityZone: pubSubProps.az,
          mapPublicIpOnLaunch: !!pubSubProps.mapPublicIpOnLaunch
        })
      )
    });
  }
}
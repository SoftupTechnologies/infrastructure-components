import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import { Tags } from '../../types/tags';
import { SubnetProps } from '../../types/subnets';
import { tagConstruct } from '../../helpers/index';

export interface VpcProps {
  vpcCidr: string;
  publicSubnetProps?: SubnetProps[];
  privateSubnetProps?: SubnetProps[];
  tags?: Tags;
  maxAzs?: number;
}

export class MyVpc extends cdk.Construct {
  public readonly privateSubnets: ec2.PrivateSubnet[] = [];
  public readonly publicSubnets: ec2.PublicSubnet[] = [];
  public readonly vpc: ec2.Vpc;
  public readonly subnetsForBastionHost: ec2.Subnet[] = [];

  constructor(scope: cdk.Construct, id: string, props: VpcProps) {
    super(scope, id);

    const vpc = new ec2.Vpc(this, 'MyVpc', {
      cidr: props.vpcCidr,
      maxAzs: props.maxAzs,
      subnetConfiguration: [{
        cidrMask: 24,
        name: 'default-public-subnet',
        subnetType: ec2.SubnetType.PUBLIC,
      }],
    });

    this.vpc = vpc;

    const { privateSubnetProps, publicSubnetProps, tags } = props;

    privateSubnetProps?.forEach((privSubProps, i) => {
      const privateSubnet = new ec2.PrivateSubnet(this, `MyPrivateSubnet${i}`, {
        cidrBlock: privSubProps.cidr,
        vpcId: vpc.vpcId,
        availabilityZone: privSubProps.az,
        mapPublicIpOnLaunch: !!privSubProps.mapPublicIpOnLaunch
      });

      tagConstruct(privateSubnet, tags);

      if (privSubProps.withBastionHost) {
        this.subnetsForBastionHost.push(privateSubnet);
      }

      this.privateSubnets.push(
        privateSubnet
      );
    });

    publicSubnetProps?.forEach((pubSubProps, i) => {
      const publicSubnet = new ec2.PublicSubnet(this, `MyPublicSubnet${i}`, {
        cidrBlock: pubSubProps.cidr,
        vpcId: vpc.vpcId,
        availabilityZone: pubSubProps.az,
        mapPublicIpOnLaunch: !!pubSubProps.mapPublicIpOnLaunch
      })

      tagConstruct(publicSubnet, tags);

      tags?.forEach((tag) => {
        cdk.Tag.add(publicSubnet, tag.key, tag.value);
      });

      if (pubSubProps.withNatGateway) {
        publicSubnet.addNatGateway();
      }

      if (pubSubProps.withBastionHost) {
        this.subnetsForBastionHost.push(publicSubnet);
      }

      this.publicSubnets.push(
        publicSubnet
      );
    });

    tagConstruct(vpc, tags);
  }
}
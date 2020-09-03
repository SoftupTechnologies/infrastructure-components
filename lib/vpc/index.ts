import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import { Tags } from '../../types/tags';
import { tagConstruct } from '../../helpers/index';

export interface VpcProps {
  vpcCidr: string;
  tags?: Tags;
  maxAzs?: number;
  publicSubnetsNo: number;
  privateSubnetsNo?: number;
  isolatedSubnetsNo?: number;
}

export class MyVpc extends cdk.Construct {
  public readonly vpc: ec2.Vpc;

  constructor(scope: cdk.Construct, id: string, props: VpcProps) {
    super(scope, id);

    const subnetConfig: ec2.SubnetConfiguration[] = [];

    const { publicSubnetsNo, privateSubnetsNo, isolatedSubnetsNo } = props;

    if (publicSubnetsNo) {
      for (let i = 0; i < publicSubnetsNo; i ++) {
        subnetConfig.push({
          cidrMask: 24,
          name: `public-${i + 1}`,
          subnetType: ec2.SubnetType.PUBLIC,
        });
      }
    }

    if (privateSubnetsNo) {
      for (let i = 0; i < privateSubnetsNo; i ++) {
        subnetConfig.push({
          cidrMask: 24,
          name: `private-${i + 1}`,
          subnetType: ec2.SubnetType.PRIVATE,
        });
      }
    }

    if (isolatedSubnetsNo) {
      for (let i = 0; i < isolatedSubnetsNo; i ++) {
        subnetConfig.push({
          cidrMask: 24,
          name: `isolated-${i + 1}`,
          subnetType: ec2.SubnetType.ISOLATED,
        });
      }
    }

    const vpc = new ec2.Vpc(this, 'MyVpc', {
      cidr: props.vpcCidr,
      maxAzs: props.maxAzs,
      subnetConfiguration: subnetConfig,
    });

    this.vpc = vpc;

    tagConstruct(vpc, props.tags);
  }
}
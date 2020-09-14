import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as autoscaling from '@aws-cdk/aws-autoscaling';
import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';
import { Asset } from '@aws-cdk/aws-s3-assets';
import { Envs } from './../../types/envs';
import path = require("path");

interface AsgStackWithAlbProps {
  env: Envs;
  projectName?: string;
  clientName?: string;
  vpc: ec2.Vpc;
  instanceType?: ec2.InstanceType;
  minCapacity?: number;
  maxCapacity?: number;
  asgName?: string;
  autoScalingGroupName?: string;
  securityGroup?: ec2.SecurityGroup;
  asgTargetPort?: number;
}

export class AsgStackWithAlb extends cdk.Construct {
  public readonly asg: autoscaling.AutoScalingGroup;
  public readonly alb: elbv2.ApplicationLoadBalancer;
  public readonly asgSecurityGroup: ec2.SecurityGroup;
  public readonly albSecurityGroup: ec2.SecurityGroup;

  constructor(scope: cdk.Construct, id: string, props: AsgStackWithAlbProps) {
    super(scope, id);

    this.alb = new elbv2.ApplicationLoadBalancer(this, 'LB', {
      vpc: props.vpc,
      internetFacing: true,
      securityGroup: this.albSecurityGroup,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
    });

    const listener = this.alb.addListener('Listener', {
      port: 80,
      open: true,
    });

    /* Adding HTTPS listener example */

    // const listener = this.alb.addListener('Listener', {
    //   port: 443,
    //   open: true,
    //   protocol: elbv2.ApplicationProtocol.HTTPS,
    //   certificates: [elbv2.ListenerCertificate.fromArn('Enter certificate arn')]
    // });

    this.asgSecurityGroup = new ec2.SecurityGroup(this, 'AsgSecurityGroup', {
      vpc: props.vpc,
      allowAllOutbound: true,
      description: 'Default ASG security group'
    });

    this.asg = new autoscaling.AutoScalingGroup(this, 'Asg', {
      vpc: props.vpc,
      instanceType: props.instanceType || ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      securityGroup: this.asgSecurityGroup,
      minCapacity: props.minCapacity || 1,
      maxCapacity: props.maxCapacity || 2,
      autoScalingGroupName: props.autoScalingGroupName ? `${props.autoScalingGroupName}-${props.env}` : `${props.projectName}-asg-${props.env}`,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE,
      }
    });

    const userDataAsset = new Asset(this, 'UserDataAssetForAsg', {
      path: path.join(__dirname, 'user_data.sh') 
    });

    const localPath = this.asg.userData.addS3DownloadCommand({
      bucket: userDataAsset.bucket,
      bucketKey: userDataAsset.s3ObjectKey,
    });

    this.asg.userData.addExecuteFileCommand({
      filePath: localPath,
    });

    userDataAsset.grantRead(this.asg.role);

    listener.addTargets('Asg', {
      port: props.asgTargetPort || 8080,
      targets: [this.asg],
    });
  }
}
import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as autoscaling from '@aws-cdk/aws-autoscaling';
import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';
import { Envs } from './../../types/envs';

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
}

export class AsgStackWithAlb extends cdk.Construct {
  public readonly asg: autoscaling.AutoScalingGroup;
  public readonly alb: elbv2.ApplicationLoadBalancer;

  constructor(scope: cdk.Construct, id: string, props: AsgStackWithAlbProps) {
    super(scope, id);

    this.asg = new autoscaling.AutoScalingGroup(this, 'Asg', {
      vpc: props.vpc,
      instanceType: props.instanceType || ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      securityGroup: props.securityGroup,
      minCapacity: props.minCapacity || 1,
      maxCapacity: props.maxCapacity || 2,
      autoScalingGroupName: `${props.autoScalingGroupName}-${props.env}` || `${props.projectName}-asg-${props.env}`,
    });

    this.alb = new elbv2.ApplicationLoadBalancer(this, 'LB', {
      vpc: props.vpc,
      internetFacing: true
    });

    const listener = this.alb.addListener('Listener', {
      port: 80,
    });

    listener.addTargets('Asg', {
      port: 8080,
      targets: [this.asg],
    });
  }
}
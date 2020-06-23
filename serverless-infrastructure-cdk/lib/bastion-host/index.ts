import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as s3 from '@aws-cdk/aws-s3';
import * as iam from '@aws-cdk/aws-iam';
import { tagConstruct } from '../../helpers';

export interface BastionHostServicesProps {
  subnets: ec2.Subnet[];
  vpc: ec2.Vpc;
  instanceName: string;
  instanceType: ec2.InstanceType;
  env: string;
  projectName: string;
  clientName: string;
};

export class BastionHostServices extends cdk.Construct {
  public readonly bastionHostInstance: ec2.BastionHostLinux;

  constructor(scope: cdk.Construct, id: string, props: BastionHostServicesProps) {
    super(scope, id);

    /**
     * Create S3 Bucket to hold public keys
     */
    const bucket = new s3.Bucket(this, 'BastionHostPublicKeys', {
      bucketName: `bastion-host-public-keys-${props.env}`,
      accessControl: s3.BucketAccessControl.PRIVATE,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    cdk.Tag.add(bucket, 'cost-center', props.clientName);
    cdk.Tag.add(bucket, 'project', props.projectName);

    /**
     * Create Security Group for the bastion host.
     */
    const bastionHostSecurityGroup = new ec2.SecurityGroup(this, 'BastionHostSecurityGroup', {
      vpc: props.vpc,
      allowAllOutbound: true,
      description: 'Enables SSH Access to Bastion Hosts'
    });

    bastionHostSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'SSH from anywhere');
    
    cdk.Tag.add(bastionHostSecurityGroup, 'cost-center', props.clientName);
    cdk.Tag.add(bastionHostSecurityGroup, 'project', props.projectName);

    /**
     * Create Role that allows the bastion host to read from S3 the public keys.
     */
    const assumeRole = new iam.ServicePrincipal('ec2.amazonaws.com');

    const bastionHostS3Policy = new iam.PolicyDocument();

    bastionHostS3Policy.addStatements(new iam.PolicyStatement({
      resources: [bucket.bucketArn],
      effect: iam.Effect.ALLOW,
      actions: ['s3:GetObject', 's3:ListObject'],
    }));

    const ec2Role = new iam.Role(this, 'EC2RoleToReadFromBucket', {
      assumedBy: assumeRole,
      inlinePolicies: {
        'bastion-s3-read': bastionHostS3Policy,
      },
    });


    /**
     * Instance Profile
     */
    const instanceProfile = new iam.CfnInstanceProfile(this, 'InstanceProfile', {
      roles: [ec2Role.roleArn],
    });

    /**
     * EC2 Instance
     */

    // const bastionInstance = new ec2.Instance(this, 'BastionHostInstance', {
    //   instanceName: 'some-name',
    //   keyName: 'serverless-something',
    //   vpc: props.vpc,
    //   role: ec2Role,
    //   securityGroup: bastionHostSecurityGroup,
    // });

    // this.bastionHostInstance = bastionHost;
  }
}
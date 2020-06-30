import { Envs } from './../../types/envs';
import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as s3 from '@aws-cdk/aws-s3';
import * as iam from '@aws-cdk/aws-iam';
import { tagConstruct } from '../../helpers';

export interface BastionHostServicesProps {
  subnets: ec2.Subnet[];
  vpc: ec2.Vpc;
  instanceName: string;
  instanceType?: ec2.InstanceType;
  env: Envs;
  projectName: string;
  clientName: string;
};

export class BastionHostServices extends cdk.Construct {
  public readonly bastionHostInstance: ec2.Instance;

  constructor(scope: cdk.Construct, id: string, props: BastionHostServicesProps) {
    super(scope, id);

    /**
     * Create S3 Bucket to hold public keys
     */
    const bucket = new s3.Bucket(this, 'BastionHostPublicKeys', {
      bucketName: `${props.projectName}-bastion-host-public-keys-${props.env}`,
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

    this.bastionHostInstance = new ec2.Instance(this, 'BastionHostInstance', {
      instanceName: `${props.projectName}-${props.instanceName}-bastion-host-${props.env}`,
      vpc: props.vpc,
      instanceType: props.instanceType || ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      machineImage: ec2.MachineImage.latestAmazonLinux({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
        edition: ec2.AmazonLinuxEdition.STANDARD,
      }),
      role: ec2Role,
      securityGroup: bastionHostSecurityGroup,
    });

    this.bastionHostInstance.userData.addExecuteFileCommand({
      filePath: './user_data.sh',
    });
  }
}
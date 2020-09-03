import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import { CloudFrontWebDistribution, OriginAccessIdentity } from '@aws-cdk/aws-cloudfront';
import { PolicyDocument, Effect, PolicyStatement } from '@aws-cdk/aws-iam';

export type ClientAppInfrastructureProps = {
  clientAppBucketName: string,
}

export class ClientAppInfrastructure extends cdk.Construct {
  public readonly clientAppDistributionId: string;
  public readonly clientAppCfDomainName: string;

  constructor(scope: cdk.Construct, id: string, props: ClientAppInfrastructureProps) {
    super(scope, id);

    const oai = new OriginAccessIdentity(this, 'ClientAppOriginAccessIdentity', {
      comment: 'OAI to access s3 only through cf',
    });
    

    const clientAppBucket = new s3.Bucket(this, 'ClientAppBucket', {
      bucketName: props.clientAppBucketName,
      publicReadAccess: true,
      websiteIndexDocument: 'index.html',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const distribution = new CloudFrontWebDistribution(this, 'ClientAppDistribution', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: clientAppBucket,
            originAccessIdentity: oai,
          },
          behaviors : [ {
            isDefaultBehavior: true,
          }]
        }
      ],
      defaultRootObject: 'index.html',
    });

    const policyStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['s3:GetObject'],
      resources: [`${clientAppBucket.bucketArn}/*`],
      principals: [oai.grantPrincipal],
    });

    const policyDocument = new PolicyDocument({
      assignSids: true,
      statements: [
        policyStatement,
      ]
    });

    new s3.CfnBucketPolicy(this, 'ClientAppBucketPolicy', {
      bucket: clientAppBucket.bucketName,
      policyDocument,
    });

    this.clientAppDistributionId = distribution.distributionId;
    this.clientAppCfDomainName = distribution.domainName;
  }
}

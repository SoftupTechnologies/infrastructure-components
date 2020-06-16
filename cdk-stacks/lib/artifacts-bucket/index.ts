import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';

export class ArtifactsBucketStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucketName = new cdk.CfnParameter(this, 'BucketName', {
      type: 'string',
    })
    const env = new cdk.CfnParameter(this, 'Environment', {
      type: 'string',
      allowedValues: ['dev', 'stage', 'prod'],
    })

    const bucket = new s3.Bucket(this, 'ArtifactsBucket', {
      bucketName: `${bucketName.valueAsString}-${env.valueAsString}`,
      accessControl: s3.BucketAccessControl.PRIVATE,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    })

    new cdk.CfnOutput(this, 'BucketName', {
      exportName: 'ArtifactBucketName',
      value: bucket.bucketName,
    })
  }
}

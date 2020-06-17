import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';

export interface IProps {
  artifactBucketName: string;
};

export class ArtifactsBucket extends cdk.Construct {
  public readonly bucketName: string;
  public readonly bucketId: string;
  public bucket: s3.Bucket;

  constructor(scope: cdk.Construct, id: string, props: IProps) {
    super(scope, id);

    const bucket = new s3.Bucket(this, 'ArtifactsBucket', {
      bucketName: props.artifactBucketName,
      accessControl: s3.BucketAccessControl.PRIVATE,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    this.bucketName = bucket.bucketName;
    this.bucket = bucket;
  }
}
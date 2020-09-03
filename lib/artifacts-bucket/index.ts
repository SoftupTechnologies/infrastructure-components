import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import { Tags } from '../../types/tags';
import { tagConstruct } from '../../helpers';

export interface IProps {
  artifactBucketName: string;
  tags?: Tags;
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
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    tagConstruct(bucket, props.tags);

    this.bucketName = bucket.bucketName;
    this.bucket = bucket;
  }
}
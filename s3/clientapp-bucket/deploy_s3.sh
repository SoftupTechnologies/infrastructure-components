#!/bin/bash

BUCKET_NAME=$1
ENVIRONMENT=$2
AWS_REGION='eu-central-1'

aws cloudformation deploy \
  --template-file ./stack.yml \
  --region $AWS_REGION \
  --stack-name $BUCKET_NAME-s3-client-app-$ENVIRONMENT \
  --parameter-overrides BucketName=$BUCKET_NAME \
                        Environment=$ENVIRONMENT

#!/bin/bash

BUCKET_NAME=$1
ENVIRONMENT=$2
PROJECT_NAME='serverless-reference-infrastructure'
CLIENT_NAME='example-client'
AWS_REGION='eu-central-1'

aws cloudformation deploy \
  --template-file ./stacks/client_app_bucket.yml \
  --region $AWS_REGION \
  --stack-name $BUCKET_NAME-s3-client-app-$ENVIRONMENT \
  --parameter-overrides BucketName=$BUCKET_NAME \
                        Environment=$ENVIRONMENT \
                        ProjectName=$PROJECT_NAME \
                        ClientName=$CLIENT_NAME

#!/bin/bash

OAI_COMMENT=$1
ENVIRONMENT=$2
AWS_REGION='eu-central-1'

aws cloudformation deploy \
  --template-file ./cdn_cf_origin_access_identity.yml \
  --region $AWS_REGION \
  --stack-name $BUCKET_NAME-s3-client-app-$ENVIRONMENT \
  --parameter-overrides OAIComment=$OAI_COMMENT \
                        Environment=$ENVIRONMENT

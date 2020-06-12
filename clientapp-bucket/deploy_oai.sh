#!/bin/bash

OAI_COMMENT=$1
ENVIRONMENT=$2
AWS_REGION='eu-central-1'

aws cloudformation deploy \
  --template-file ./stacks/cdn_cf_origin_access_identity.yml \
  --region $AWS_REGION \
  --stack-name $OAI_COMMENT-s3-client-app-$ENVIRONMENT \
  --parameter-overrides OAIComment=$OAI_COMMENT \
                        Environment=$ENVIRONMENT

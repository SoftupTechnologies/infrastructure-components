#!/bin/bash

DISTRIBUTION_NAME=$1
ENVIRONMENT=$2
AWS_REGION='eu-central-1'

aws cloudformation deploy \
  --template-file ./cdn_distribution_stack.yml \
  --region $AWS_REGION \
  --stack-name $DISTRIBUTION_NAME-cdn-$ENVIRONMENT \
  --parameter-overrides DistributionName=$DISTRIBUTION_NAME \
                        Environment=$ENVIRONMENT
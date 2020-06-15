#!/bin/bash

set -Eeuo pipefail

PUB_KEYS_BUCKET_NAME=$1
INSTANCE_NAME=$2
ENVIRONMENT=$3
AWS_REGION='eu-central-1'

aws cloudformation deploy \
  --region $AWS_REGION \
  --template-file ./stacks/bastion-host.yml \
  --stack-name $INSTANCE_NAME-bastion-host-$ENVIRONMENT \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides Environment=$ENVIRONMENT \
                        PubKeysBucketName=$PUB_KEYS_BUCKET_NAME \
                        InstanceName=$INSTANCE_NAME
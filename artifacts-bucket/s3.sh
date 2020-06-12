#!/bin/bash

set -Eeuo pipefail

PROJECT_NAME='serverless-reference-infrastructure'
ENVIRONMENT='dev'
AWS_REGION='eu-central-1'

aws cloudformation deploy \
  --region $AWS_REGION \
  --profile ${AWS_PROFILE:-default} \
  --template-file ./stacks/s3-stack.yml \
  --stack-name $PROJECT_NAME-bucket-artifacts-$ENVIRONMENT \
  --no-fail-on-empty-changeset \
  --parameter-overrides Environment=$ENVIRONMENT \
                        ProjectName=$PROJECT_NAME

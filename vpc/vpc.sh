#!/bin/bash

PROJECT_NAME='serverless-reference-infrastructure'
CLIENT_NAME='example-client'
ENVIRONMENT='dev'
AWS_REGION='eu-central-1'

aws cloudformation deploy \
  --template-file ./stacks/vpc-stack.yml \
  --region $AWS_REGION \
  --stack-name $VPC_NAME-vpc-$ENVIRONMENT \
  --parameter-overrides Environment=$ENVIRONMENT \
                        ProjectName=$PROJECT_NAME \
                        ClientName=$CLIENT_NAME
#!/bin/bash

DB_USERNAME='postgres'
DB_PASSWORD='example123'
ENVIRONMENT='dev'
SUBNET='subnet-033d53e11bc23a592,subnet-0e85166127de0980d'
AWS_REGION='eu-central-1'

aws cloudformation deploy \
  --template-file ./stacks/rds-stack.yml \
  --region $AWS_REGION \
  --stack-name serverless-reference-infrastructure-rds-$ENVIRONMENT \
  --parameter-overrides Environment=$ENVIRONMENT \
                        DBUsername=$DB_USERNAME \
                        DBPassword=$DB_PASSWORD \
                        Subnets=$SUBNET

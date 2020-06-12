#!/bin/bash

source ./bash_utils/stack.sh
source ./bash_utils/ssm.sh

PROJECT_NAME=serverless-reference-infrastructure
AWS_REGION=eu-central-1
ENVIRONMENT=dev

vpc_output=$(stack_output $PROJECT_NAME-vpc-$ENVIRONMENT)
vpc_id=$(param_from_stack_output "$vpc_output" VPC)
subnets=$(param_from_stack_output "$vpc_output" PrivateSubnets)

db_user=$(get_ssm $PROJECT_NAME-rds-user-$ENVIRONMENT)
db_password=$(get_ssm $PROJECT_NAME-rds-pass-$ENVIRONMENT)

aws cloudformation deploy \
  --template-file ./stacks/rds-stack.yml \
  --region $AWS_REGION \
  --stack-name serverless-reference-infrastructure-rds-$ENVIRONMENT \
  --parameter-overrides Environment=$ENVIRONMENT \
                        DBUsername=$db_user \
                        DBPassword=$db_password \
                        Subnets=$subnets \
                        VpcId=$vpc_id \
                        InstanceType=db.t2.micro

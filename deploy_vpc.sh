#!/bin/bash

# $1 Stack name
# $2 Env


aws cloudformation deploy \
  --template-file ./vpc_stack.yml \
  --stack-name $1 \
  --parameter-overrides Env=$2
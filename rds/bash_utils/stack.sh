function stack_output {
  aws cloudformation describe-stacks \
    --region $AWS_REGION \
    --stack-name $1 \
    --output text \
    --query 'Stacks[*].Outputs[*].[OutputKey, OutputValue]'
}

function param_from_stack_output {
  echo "$1" | grep "$2" | awk '{print $2}'
}

function get_ssm {
    aws ssm get-parameter \
        --region $AWS_REGION \
        --name "$1" \
        --with-decryption \
        --query Parameter.Value \
        --output text
}
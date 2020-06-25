#!/bin/bash

mkdir /usr/bin/bastion

#The public keys are stored on 
# S3 with the following naming convention: "username.pub". This 
# script retrieves the public keys, creates or deletes local user 
# accounts as needed, and copies the public key to 
# /home/username/.ssh/authorized_keys

cat > /usr/bin/bastion/sync_users << 'EOF'

# The function returns the user name from the public key file name.
# Example: public-keys/sshuser.pub => sshuser
get_user_name () {
  echo "$1" | sed -e 's/.*\///g' | sed -e 's/\.pub//g'
}

# For each public key available in the S3 bucket
aws s3api list-objects --bucket ${PubKeysBucketName}-s3-bucket-${Environment} --prefix public-keys/ --region ${AWS::Region}  --output text --query 'Contents[?Size>`0`].Key' | sed -e 'y/\t/\n/' > ~/keys_retrieved_from_s3
while read line; do
  USER_NAME="`get_user_name "$line"`"

  # Make sure the user name is alphanumeric
  if [[ "$USER_NAME" =~ ^[a-z][-a-z0-9]*$ ]]; then

    # Create a user account if it does not already exist
    cut -d: -f1 /etc/passwd | grep -qx $USER_NAME
    if [ $? -eq 1 ]; then
      /usr/sbin/adduser $USER_NAME && \
      mkdir -m 700 /home/$USER_NAME/.ssh && \
      chown $USER_NAME:$USER_NAME /home/$USER_NAME/.ssh && \
      echo "$line" >> ~/keys_installed
    fi

    # Copy the public key from S3, if a user account was created 
    # from this key
    if [ -f ~/keys_installed ]; then
      grep -qx "$line" ~/keys_installed
      if [ $? -eq 0 ]; then
        aws s3 cp s3://${PubKeysBucketName}-s3-bucket-${Environment}/$line /home/$USER_NAME/.ssh/authorized_keys --region ${AWS::Region}
        chmod 600 /home/$USER_NAME/.ssh/authorized_keys
        chown $USER_NAME:$USER_NAME /home/$USER_NAME/.ssh/authorized_keys
      fi
    fi

  fi
done < ~/keys_retrieved_from_s3

# Remove user accounts whose public key was deleted from S3
if [ -f ~/keys_installed ]; then
  sort -uo ~/keys_installed ~/keys_installed
  sort -uo ~/keys_retrieved_from_s3 ~/keys_retrieved_from_s3
  comm -13 ~/keys_retrieved_from_s3 ~/keys_installed | sed "s/\t//g" > ~/keys_to_remove
  while read line; do
    USER_NAME="`get_user_name "$line"`"
    /usr/sbin/userdel -r -f $USER_NAME
  done < ~/keys_to_remove
  comm -3 ~/keys_installed ~/keys_to_remove | sed "s/\t//g" > ~/tmp && mv ~/tmp ~/keys_installed
fi

EOF

chmod 700 /usr/bin/bastion/sync_users

cat > ~/mycron << EOF
*/3 * * * * /usr/bin/bastion/sync_users
0 0 * * * yum -y update --security
EOF
crontab ~/mycron
rm ~/mycron
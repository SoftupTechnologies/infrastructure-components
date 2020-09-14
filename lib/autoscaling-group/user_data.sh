amazon-linux-extras install docker
service docker start
usermod -a -G docker ec2-user

sudo chkconfig docker on

sudo curl -L https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose

sudo chmod +x /usr/local/bin/docker-compose

sudo reboot

docker run -p 8080:80 yeasy/simple-web:latest
#!/bin/bash -xe
export DEBIAN_FRONTEND=noninteractive

apt-get update
apt-get install -y gnupg apache2 wget curl

# Init Section
queue_host=""
queue_name=""
queue_user=""
queue_pass=""

printf "ServerName localhost\nProxyPass / http://localhost:8000/" >> /etc/apache2/apache2.conf

#installing nodejs
apt-get install -y libcurl4 curl
curl -sL https://deb.nodesource.com/setup_12.x | bash -
apt-get install -y nodejs
node -v

mkdir -p /var/www/html/nodejs

cd /var/www/html/nodejs
sed -i "s/QUEUE_HOST/$queue_host/g" index.js
sed -i "s/QUEUE_NAME/$queue_name/g" index.js
sed -i "s/QUEUE_USER/$queue_user/g" index.js
sed -i "s/QUEUE_PASS/$queue_pass/g" index.js
chmod 755 index.js

npm i express amqplib

npm install -g pm2
pm2 start index.js

a2enmod proxy
a2enmod proxy_http
service apache2 restart
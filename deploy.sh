#!/bin/bash -xe
export DEBIAN_FRONTEND=noninteractive

apt-get update
apt-get install -y gnupg apache2 wget unzip postgresql postgresql-contrib curl

# Init Section
queue_host=""
queue_name=""
queue_user=""
queue_pass=""
gcp_subscription_name="projects/midyear-glazing-262517/subscriptions/hw26-pubsub"
gcp_queue_name="hw26-queue"
db_host=""
db_port="5432"
db_name=""
db_user=""
db_pass=""

instanceId="`wget -q -O - http://169.254.169.254/latest/meta-data/instance-id || die \"wget instance-id has failed: $?\"`"

export PGHOST=$db_host
export PGUSER=postgres
export PGPASSWORD=postgres123pass

echo '
create database "'$db_name'";
create user '$db_user' with encrypted password '\'$db_pass\'';
\c '$db_name';
CREATE TABLE IF NOT EXISTS views (
view_id SERIAL PRIMARY KEY,
client_ip INET,
instance_id VARCHAR(100),
view_date TIMESTAMP
);
grant all privileges on table views to '$db_user';
grant all on sequence views_view_id_seq to '$db_user';' | tee /tmp/create.sql

psql < /tmp/create.sql

printf "ServerName localhost\nProxyPass / http://localhost:8000/" >> /etc/apache2/apache2.conf

#installing nodejs
apt-get install -y libcurl4 curl
curl -sL https://deb.nodesource.com/setup_12.x | bash -
apt-get install -y nodejs
node -v

mkdir -p /var/www/html/nodejs

cd /var/www/html/nodejs
rm /var/www/html/index.html
sed -i "s/INSTANCE_ID/$instanceId/g" index.js
sed -i "s/DB_HOST/$db_host/g" index.js
sed -i "s/DB_PORT/$db_port/g" index.js
sed -i "s/DB_NAME/$db_name/g" index.js
sed -i "s/DB_USER/$db_user/g" index.js
sed -i "s/DB_PASS/$db_pass/g" index.js
sed -i "s/QUEUE_HOST/$queue_host/g" index.js
sed -i "s/QUEUE_HOST/$queue_host/g" index.js
sed -i "s/QUEUE_NAME/$queue_name/g" index.js
sed -i "s/QUEUE_USER/$queue_user/g" index.js
sed -i "s/GCP_SUBSCRIPTION_NAME/$gcp_subscription_name/g" index.js
sed -i "s/GCP_QUEUE_NAME/$gcp_queue_name/g" index.js
chmod 755 index.js

npm i pg express amqplib gcp-metadata @google-cloud/pubsub

npm install -g pm2
pm2 start index.js

a2enmod proxy
a2enmod proxy_http
service apache2 restart
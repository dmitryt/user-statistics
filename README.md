# user-statistics
Application tracks the user activity. When user has visited the page more, than 10 times, it sends an email to administrator via message queue.

## Deploy Main App
To deploy an application:
1. Clone app to the host.
2. Move `index.js` file into `/var/www/html/nodejs` folder.
3. Update the "Init Section" in `deploy.sh` file and run it.

## Deploy Email Sender App
To deploy an application:
1. Clone app to the host.
2. Move `sender` folder's content `/var/www/html/nodejs` folder.
3. Update the "Init Section" in `deploy.sh` file and run it.

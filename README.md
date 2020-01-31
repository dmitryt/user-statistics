# user-statistics
Application tracks the user activity. When user has visited the page more, than 10 times, it sends an email to administrator via message queue(it launches Lambda function(lambda.js file) under the hood).

## Deploy
To deploy an application:
1. Clone app to the host.
2. Move move `index.js` file into `/var/www/html/nodejs` folder.
3. Update the "Init Section" in `deploy.sh` file and run it.

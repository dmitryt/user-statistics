const Pool = require('pg').Pool;
const express = require('express');
const http = require('http');
const aws = require('aws-sdk');
const gcpMetadata = require('gcp-metadata');
const port = 8000;

let instanceId;
gcpMetadata.instance('id').then(id => {
	instanceId = id.toString();
});

// Set the region
aws.config.update({region: 'us-east-2'});

// Create an SQS service object
const sqs = new aws.SQS({ apiVersion: '2012-11-05' });

const pool = new Pool({
  user: 'DB_USER',
  host: 'DB_HOST',
  database: 'DB_NAME',
  password: 'DB_PASS',
  port: 'DB_PORT',
});

const maxQueriesPerDay = 10;

const app = express();

const sendToQueue = (clientIp) => {
  var sqsParams = {
    MessageBody: JSON.stringify({ clientIp }),
    QueueUrl: 'SQS_QUEUE_URL'
  };
  sqs.sendMessage(sqsParams, function(err, data) {
    if (err) {
      console.log('ERR', err);
    }
    console.log(data);
  });
};

// the pool will emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

app.get('/', function (req, res) {
  pool.connect(function(err, client, done) {
    if(err) {
      console.log(err);
      res.send('Error during connecting to DB.');
      client.release();
      return;
    }
    const forwarded = req.headers['x-forwarded-for'];
    const clientIp = forwarded ? forwarded.split(/, /)[0] : req.connection.remoteAddress;
    const query = {
      text: 'INSERT INTO views(client_ip, instance_id, view_date) VALUES($1, $2, $3)',
      values: [
        clientIp,
        instanceId,
        new Date(),
      ],
    }

    client.query(query, (err, results) => {
      if(err) {
        console.log(err);
        res.status(400).send(`Error during inserting data to DB.\n${err}\n`);
        client.release();
        return;
      }
      res.send('<a href="/stats">Statistics</a> have been updated successfully');
      client.release();
    });

    const today = new Date();
    const formatDate = d => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
    const todayStr = formatDate(today);
    today.setDate(today.getDate() + 1);
    const tomorrowStr = formatDate(today);

    console.log('CHECKING DATA BETWEEN', todayStr, tomorrowStr);

    const queryFrequency = {
      text: 'SELECT instance_id, client_ip, view_date FROM views WHERE client_ip = $1 and view_date >= $2 and view_date < $3',
      values: [
        clientIp,
        todayStr,
        tomorrowStr,
      ],
    }

    client.query(queryFrequency, (err, results) => {
      if(err) {
        console.log(err);
        res.send('Error while fetching the data from DB.\n', err);
        client.release();
        return;
      }

      if (results.rows.length > maxQueriesPerDay) {
        sendToQueue(clientIp);
      }
    });

  });
});

app.get('/stats', function (req, res) {
  pool.connect(function(err, client, done) {
    if(err) {
      res.send('Error during connecting to DB.\n', err);
      client.close();
      return;
    }

    const query = {
      text: 'SELECT instance_id, client_ip, view_date FROM views',
    }

    client.query(query, (err, results) => {
      if(err) {
        client.release();
        res.send('Error while fetching the data from DB.\n', err);
        return;
      }
      const header = `<thead>
        <tr>
          <th>Instance Id</th>
          <th>Client IP</th>
          <th>Timestamp</th>
        </tr>
      </thead>`;
      const data = `<a href="/">Home</a><br/><table border="1">${header}<tbody>%s</tbody></table>`;
      const content = results.rows.reduce((acc, row) => acc + `
        <tr>
          <td>${row.instance_id}</td>
          <td>${row.client_ip}</td>
          <td>${row.view_date}</td>
        </tr>`, '');
      res.send(data.replace('%s', content));
    });
  });
});

app.listen(port, 'localhost', (err) => {
  if (err) {
      return console.log('something bad happened', err)
  }
  console.log(`server is listening on ${port}`)
})
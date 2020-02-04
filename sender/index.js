#!/usr/bin/env node

const amqp = require('amqplib/callback_api');
const express = require('express');
const http = require('http');

const handler = require('./lambda');

const port = 8000;

const connectParams = {
  protocol: 'amqp',
  hostname: 'QUEUE_HOST',
  port: 5672,
  username: 'QUEUE_HOST',
  password: 'QUEUE_PASS',
  locale: 'en_US',
  frameMax: 0,
  heartbeat: 0,
  vhost: '/',
}

const app = express();

app.get('/', function (req, res) {
  amqp.connect(connectParams, (error0, connection) => {, (error0, connection) => {
    if (error0) {
      throw error0;
    }
    connection.createChannel((error1, channel) => {
      if (error1) {
        throw error1;
      }

      const queue = 'QUEUE_NAME';

      channel.assertQueue(queue, {
        durable: false
      });

      console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', queue);

      channel.consume(queue, (msg) => {
          console.log(' [x] Received %s', msg.content.toString());
          ;
          res.send(data.replace('%s', handler(msg.content.toString())));
        },
        { noAck: true }
      );
    });
  });
});

app.listen(port, 'localhost', (err) => {
  if (err) {
      return console.log('something bad happened', err)
  }
  console.log(`server is listening on ${port}`)
})



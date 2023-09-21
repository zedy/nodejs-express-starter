/* eslint-disable comma-dangle */
/* eslint-disable consistent-return */
/* eslint-disable no-console */
import { connect } from 'amqplib/callback_api';
import { config } from 'dotenv';

config();

let conn;

// Create connection to AMQP server
connect('amqp://localhost', (err, connection) => {
  if (err) {
    console.error(err.stack);
    return process.exit(1);
  }

  conn = connection;
  console.log('RabbitMQ Publisher server up and running');
});


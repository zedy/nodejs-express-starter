/* eslint-disable comma-dangle */
/* eslint-disable no-console */
/* eslint-disable consistent-return */
import { connect } from 'amqplib/callback_api';
import { createTransport } from 'nodemailer';
import { config } from 'dotenv';

config();

// Create connection to AMQP server
connect('amqp://localhost', async (err, connection) => {
  if (err) {
    console.error(err.stack);
    return process.exit(1);
  }

  // Setup Nodemailer transport
  const transport = createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.SERVICE_EMAIL,
      serviceClient: process.env.SERVICE_CLIENT_ID,
      privateKey: process.env.SERVICE_PRIVATE_KEY,
    },
  });

  // Create channel
  connection.createChannel((error, channel) => {
    if (error) {
      console.error(error.stack);
      return process.exit(1);
    }

    // Ensure queue for messages
    channel.assertQueue(
      'nodemailer-amqp',
      {
        // Ensure that the queue is not deleted when server restarts
        durable: true,
      },
      (assertErr) => {
        if (assertErr) {
          console.error(assertErr.stack);
          return process.exit(1);
        }

        // Only request 1 unacked message from queue
        // This value indicates how many messages we want to process in parallel
        channel.prefetch(1);

        // Set up callback to handle messages received from the queue
        channel.consume('nodemailer-amqp', (data) => {
          if (data === null) {
            return;
          }

          // Decode message contents
          const message = JSON.parse(data.content.toString());

          // Send the message using the previously set up Nodemailer transport
          transport.sendMail(message, (sendErr, info) => {
            if (sendErr) {
              console.error(sendErr.stack);
              // put the failed message item back to queue
              return channel.nack(data);
            }
            console.log('RabbitMQ delivered message %s', info.messageId);
            // remove message item from the queue
            channel.ack(data);
          });
        });
      }
    );
  });
  console.log('RabbitMQ Subscriber server up and running');
});

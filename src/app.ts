import express, { json } from 'express';
import helmet from 'helmet';
import cors from 'cors';

import * as AWS from 'aws-sdk';

const sqs = new AWS.SQS({
  apiVersion: 'latest'
});

import { NotifyService } from './services/NotifyService';

const app = express();
app.use(json());
app.use(helmet());
app.use(cors());

app.get('/', (_, res) => {
  res.json({
    msg: 'Hello World',
  });
});

app.post('/', async (req, res) => {
  const { body } = req;
  // res.json({ status: 'OK' })

  const { transaction, subscriber, event } = body;
  const service = new NotifyService({
    transaction,
    subscriber,
    event, // confirmed unconfirmed
  });

  try {
    await service.call();
    res.json({ status: 'Ok' });
  } catch (e) {
    console.error(e);
    res.json({ error: (e as Error).message });
  }
});

app.post('/enqueue', async (req, res) => {
  const { body } = req;
  // res.json({ status: 'OK' })

  const { transaction, subscriber, event } = body;

  try {
    await sqs.sendMessage({
      QueueUrl: 'https://sqs.us-east-1.amazonaws.com/419892788374/whale-alerts-bot-prod-purchases.fifo',
      MessageDeduplicationId: transaction.id,
      MessageGroupId: subscriber.userId,
      // Any message data we want to send
      MessageBody: JSON.stringify({
          transaction,
          subscriber,
          event
      }),
    }).promise();

    res.json({ status: 'OK'});

  } catch(e) {
    console.log(e)
    res.json({ error: (e as Error).message });
  }
});

app.use((_, res, _2) => {
  res.status(404).json({ error: 'NOT FOUND' });
});

export { app };

import express, { json } from 'express';
import helmet from 'helmet';

import { NotifyService } from './services/NotifyService';

const app = express();
app.use(json());
app.use(helmet());

app.get('/', (_, res) => {
  res.json({
    msg: 'Hello World',
  });
});

app.post('/', async (req, res) => {
  const { body } = req;

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
    res.json({ error: (e as Error).message });
  }
});

app.use((_, res, _2) => {
  res.status(404).json({ error: 'NOT FOUND' });
});

export { app };

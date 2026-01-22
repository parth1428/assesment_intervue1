import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { pollRouter } from './routes/pollRoutes';

const app = express();

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/polls', pollRouter);

export default app;

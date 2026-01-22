import http from 'http';
import app from './app';
import { connectDatabase } from './config/db';
import { env } from './config/env';
import { initSocket } from './socket';

const start = async () => {
  await connectDatabase();

  const server = http.createServer(app);
  initSocket(server);

  server.listen(env.port, () => {
    console.log(`Server listening on ${env.port}`);
  });
};

start();

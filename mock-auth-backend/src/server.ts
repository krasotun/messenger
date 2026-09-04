import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import { authRouter } from './routes/auth';
import { chatsRouter } from './routes/chats';
import { userRouter } from './routes/user';
import { resetStore } from './store';

const app = express();
const port = Number(process.env['PORT'] ?? 3000);

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.get('/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.post('/test/reset', (_request, response) => {
  resetStore();

  response.type('text/plain').send('OK');
});

app.use(authRouter);
app.use(userRouter);
app.use(chatsRouter);

app.listen(port, () => {
  console.log(`Mock auth backend listening on port ${port}`);
});

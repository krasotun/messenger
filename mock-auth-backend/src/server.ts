import crypto from 'node:crypto';

import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

const app = express();
const port = Number(process.env['PORT'] ?? 3000);
interface User {
  id: number;
  first_name: string;
  second_name: string;
  display_name: string | null;
  login: string;
  email: string;
  password: string;
  phone: string;
  avatar: string | null;
}

interface SignUpRequest {
  first_name: string;
  second_name: string;
  login: string;
  email: string;
  password: string;
  phone: string;
}

const usersByLogin = new Map<string, User>();
let nextUserId = 1;

const sessionsById = new Map<string, number>();
const sessionCookieName = 'mock_auth_session';

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
  usersByLogin.clear();
  sessionsById.clear();
  nextUserId = 1;

  response.type('text/plain').send('OK');
});

app.post('/auth/signup', (request, response) => {
  const body = request.body as SignUpRequest;

  if (usersByLogin.has(body.login)) {
    response.status(400).json({ reason: 'Login already exists' });
    return;
  }

  const user: User = {
    id: nextUserId,
    first_name: body.first_name,
    second_name: body.second_name,
    display_name: null,
    login: body.login,
    email: body.email,
    password: body.password,
    phone: body.phone,
    avatar: null,
  };

  nextUserId += 1;
  usersByLogin.set(user.login, user);

  response.json({ id: user.id });
});

app.post('/auth/signin', (request, response) => {
  const body = request.body as { login: string; password: string };
  const user = usersByLogin.get(body.login);

  if (!user || user.password !== body.password) {
    response.status(400).json({ reason: 'Invalid login or password' });
    return;
  }

  const sessionId = crypto.randomUUID();
  sessionsById.set(sessionId, user.id);

  response.cookie(sessionCookieName, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });

  response.type('text/plain').send('OK');
});

app.get('/auth/user', (request, response) => {
  const sessionId = request.cookies[sessionCookieName] as string | undefined;

  if (!sessionId) {
    response.sendStatus(401);
    return;
  }

  const userId = sessionsById.get(sessionId);

  if (!userId) {
    response.sendStatus(401);
    return;
  }

  const user = [...usersByLogin.values()].find((candidate) => candidate.id === userId);

  if (!user) {
    response.sendStatus(401);
    return;
  }

  response.json({
    id: user.id,
    first_name: user.first_name,
    second_name: user.second_name,
    display_name: user.display_name,
    login: user.login,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar,
  });
});

app.post('/auth/logout', (request, response) => {
  const sessionId = request.cookies[sessionCookieName] as string | undefined;

  if (sessionId) {
    sessionsById.delete(sessionId);
  }

  response.clearCookie(sessionCookieName, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });

  response.type('text/plain').send('OK');
});

app.listen(port, () => {
  console.log(`Mock auth backend listening on port ${port}`);
});

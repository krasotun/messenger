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

interface UpdateProfileRequest {
  first_name: string;
  second_name: string;
  display_name: string | null;
  login: string;
  email: string;
  phone: string;
}

function findUserBySession(request: express.Request): User | undefined {
  const sessionId = request.cookies[sessionCookieName] as string | undefined;

  if (!sessionId) {
    return undefined;
  }

  const userId = sessionsById.get(sessionId);

  if (!userId) {
    return undefined;
  }

  return [...usersByLogin.values()].find((candidate) => candidate.id === userId);
}

app.put('/user/profile', (request, response) => {
  const user = findUserBySession(request);

  if (!user) {
    response.sendStatus(401);
    return;
  }

  const body = request.body as UpdateProfileRequest;
  const userWithSameLogin = usersByLogin.get(body.login);

  if (userWithSameLogin && userWithSameLogin.id !== user.id) {
    response.status(400).json({ reason: 'Login already exists' });
    return;
  }

  const updatedUser: User = {
    ...user,
    first_name: body.first_name,
    second_name: body.second_name,
    display_name: body.display_name,
    login: body.login,
    email: body.email,
    phone: body.phone,
  };

  usersByLogin.delete(user.login);
  usersByLogin.set(updatedUser.login, updatedUser);

  response.json({
    id: updatedUser.id,
    first_name: updatedUser.first_name,
    second_name: updatedUser.second_name,
    display_name: updatedUser.display_name,
    login: updatedUser.login,
    email: updatedUser.email,
    phone: updatedUser.phone,
    avatar: updatedUser.avatar,
  });
});

// Файл не сохраняется: реальный бэкенд отдает путь к нему, а мок повторяет
// только статусы и форму ответа. Тело разбирается регуляркой по заголовкам
// части, чтобы не тащить парсер multipart ради одного эндпоинта.
const acceptedAvatarMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

app.put(
  '/user/profile/avatar',
  express.raw({ type: 'multipart/form-data', limit: '10mb' }),
  (request, response) => {
    const user = findUserBySession(request);

    if (!user) {
      response.sendStatus(401);
      return;
    }

    const body = Buffer.isBuffer(request.body) ? request.body.toString('latin1') : '';

    const fileName = /name="avatar";\s*filename="([^"]*)"/.exec(body)?.[1];
    const mimeType = /Content-Type:\s*([\w/+.-]+)/i.exec(body)?.[1];

    if (!fileName) {
      response.status(400).json({ reason: 'Avatar file is required' });
      return;
    }

    if (!mimeType || !acceptedAvatarMimeTypes.includes(mimeType)) {
      response.status(400).json({ reason: 'Unsupported avatar format' });
      return;
    }

    const updatedUser: User = { ...user, avatar: `/mock-avatars/${user.id}/${fileName}` };

    usersByLogin.set(updatedUser.login, updatedUser);

    response.json({
      id: updatedUser.id,
      first_name: updatedUser.first_name,
      second_name: updatedUser.second_name,
      display_name: updatedUser.display_name,
      login: updatedUser.login,
      email: updatedUser.email,
      phone: updatedUser.phone,
      avatar: updatedUser.avatar,
    });
  },
);

interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

app.put('/user/password', (request, response) => {
  const user = findUserBySession(request);

  if (!user) {
    response.sendStatus(401);
    return;
  }

  const body = request.body as ChangePasswordRequest;

  if (user.password !== body.oldPassword) {
    response.status(400).json({ reason: 'Password is incorrect' });
    return;
  }

  usersByLogin.set(user.login, { ...user, password: body.newPassword });

  response.type('text/plain').send('OK');
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

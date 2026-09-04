import express, { Router } from 'express';

import { findUserBySession, User, usersByLogin } from '../store';

interface UpdateProfileRequest {
  first_name: string;
  second_name: string;
  display_name: string | null;
  login: string;
  email: string;
  phone: string;
}

interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

interface FindUserRequest {
  login: string;
}

export const userRouter = Router();

userRouter.put('/user/profile', (request, response) => {
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

userRouter.put(
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

userRouter.put('/user/password', (request, response) => {
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

const maxUserSearchResults = 10;

userRouter.post('/user/search', (request, response) => {
  const user = findUserBySession(request);

  if (!user) {
    response.sendStatus(401);
    return;
  }

  const body = request.body as FindUserRequest;

  const matches = [...usersByLogin.values()]
    .filter((candidate) => candidate.login.startsWith(body.login))
    .slice(0, maxUserSearchResults);

  response.json(
    matches.map((match) => ({
      id: match.id,
      first_name: match.first_name,
      second_name: match.second_name,
      display_name: match.display_name,
      login: match.login,
      email: match.email,
      phone: match.phone,
      avatar: match.avatar,
    })),
  );
});

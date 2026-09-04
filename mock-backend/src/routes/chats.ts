import { Router } from 'express';

import {
  Chat,
  chatsById,
  chatUserIdsByChatId,
  findUserById,
  findUserBySession,
  nextChatId,
} from '../store';

interface CreateChatRequest {
  title: string;
}

interface UsersRequest {
  chatId: number;
  users: number[];
}

export const chatsRouter = Router();

chatsRouter.get('/chats', (request, response) => {
  const user = findUserBySession(request);

  if (!user) {
    response.sendStatus(401);
    return;
  }

  const chats = [...chatsById.values()].filter((chat) =>
    chatUserIdsByChatId.get(chat.id)?.has(user.id),
  );

  response.json(
    chats.map((chat) => ({
      id: chat.id,
      title: chat.title,
      avatar: chat.avatar,
      unread_count: 0,
      last_message: null,
    })),
  );
});

chatsRouter.post('/chats', (request, response) => {
  const user = findUserBySession(request);

  if (!user) {
    response.sendStatus(401);
    return;
  }

  const body = request.body as CreateChatRequest;

  const chat: Chat = {
    id: nextChatId(),
    title: body.title,
    avatar: null,
  };

  chatsById.set(chat.id, chat);
  chatUserIdsByChatId.set(chat.id, new Set([user.id]));

  response.json({ id: chat.id });
});

chatsRouter.get('/chats/:id/users', (request, response) => {
  const user = findUserBySession(request);

  if (!user) {
    response.sendStatus(401);
    return;
  }

  const chatId = Number(request.params['id']);
  const chat = chatsById.get(chatId);

  if (!chat) {
    response.sendStatus(404);
    return;
  }

  const chatUserIds = chatUserIdsByChatId.get(chatId) ?? new Set<number>();
  const chatUsers = [...chatUserIds].map((id) => findUserById(id)).filter((u) => u !== undefined);

  response.json(
    chatUsers.map((chatUser) => ({
      id: chatUser.id,
      first_name: chatUser.first_name,
      second_name: chatUser.second_name,
      display_name: chatUser.display_name,
      login: chatUser.login,
      email: chatUser.email,
      phone: chatUser.phone,
      avatar: chatUser.avatar,
      role: 'regular',
    })),
  );
});

chatsRouter.put('/chats/users', (request, response) => {
  const user = findUserBySession(request);

  if (!user) {
    response.sendStatus(401);
    return;
  }

  const body = request.body as UsersRequest;
  const chat = chatsById.get(body.chatId);

  if (!chat) {
    response.status(400).json({ reason: 'Chat not found' });
    return;
  }

  const unknownUserId = body.users.find((userId) => !findUserById(userId));

  if (unknownUserId !== undefined) {
    response.status(400).json({ reason: 'User not found' });
    return;
  }

  const chatUserIds = chatUserIdsByChatId.get(chat.id) ?? new Set<number>();

  for (const userId of body.users) {
    chatUserIds.add(userId);
  }

  chatUserIdsByChatId.set(chat.id, chatUserIds);

  response.sendStatus(200);
});

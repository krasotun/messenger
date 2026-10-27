import { signal } from '@angular/core';
import { Subject } from 'rxjs';

import { ChatListService } from '../chat-list/chat-list.service';
import { ChatUser } from '../chat-user.type';
import { ChatUsersService } from '../chat-users/chat-users.service';
import { RemoveChatUserService } from '../chat-users/remove-chat-user.service';
import { ChatGateway } from '../chat.gateway';
import { Chat } from '../chat.type';
import { CreateChatService } from '../create-chat/create-chat.service';
import { DeleteChatService } from '../selected-chat/delete-chat.service';

// Каждый вызов отдает новый двойник: сбрасывать его между тестами не нужно.
export const ChatMocks = {
  chat: (overrides: Partial<Chat> = {}): Chat => ({
    id: 1,
    title: 'Chat',
    avatar: null,
    unreadCount: 0,
    createdBy: 1,
    lastMessage: null,
    ...overrides,
  }),

  chatUser: (overrides: Partial<ChatUser> = {}): ChatUser => ({
    id: 1,
    name: 'Chat user',
    avatar: null,
    ...overrides,
  }),

  chatGateway: () => ({
    chats: vi.fn<ChatGateway['chats']>(),
    createChat: vi.fn<ChatGateway['createChat']>(),
    deleteChat: vi.fn<ChatGateway['deleteChat']>(),
    chatUsers: vi.fn<ChatGateway['chatUsers']>(),
    addChatUser: vi.fn<ChatGateway['addChatUser']>(),
    removeChatUser: vi.fn<ChatGateway['removeChatUser']>(),
  }),

  // succeeded$ - Subject, чтобы тест сам сообщал об успехе через next().
  deleteChatService: () => ({
    deleteChat: vi.fn<DeleteChatService['deleteChat']>(),
    succeeded$: new Subject<void>(),
  }),

  removeChatUserService: () => ({
    removeChatUser: vi.fn<RemoveChatUserService['removeChatUser']>(),
    succeeded$: new Subject<void>(),
  }),

  chatListService: () => ({
    loadChats: vi.fn<ChatListService['loadChats']>(),
  }),

  chatUsersService: () => ({
    loadChatUsers: vi.fn<ChatUsersService['loadChatUsers']>(),
  }),

  createChatService: () => ({
    createChat: vi.fn<CreateChatService['createChat']>(),
    isSubmitting: signal(false),
    succeeded$: new Subject<void>(),
  }),
};

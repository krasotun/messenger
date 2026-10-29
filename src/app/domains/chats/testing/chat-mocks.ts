import { Chat } from '../data/chat';
import { ChatGateway } from '../data/chat-gateway';
import { ChatUser } from '../data/chat-user';

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
};

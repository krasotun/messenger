import { Request } from 'express';

export interface User {
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

export interface Chat {
  id: number;
  title: string;
  avatar: string | null;
}

export const sessionCookieName = 'mock_auth_session';

export const usersByLogin = new Map<string, User>();
export const sessionsById = new Map<string, number>();

export const chatsById = new Map<number, Chat>();
export const chatUserIdsByChatId = new Map<number, Set<number>>();

const nextIds = { user: 1, chat: 1 };

export function nextUserId(): number {
  return nextIds.user++;
}

export function nextChatId(): number {
  return nextIds.chat++;
}

export function resetStore(): void {
  usersByLogin.clear();
  sessionsById.clear();
  chatsById.clear();
  chatUserIdsByChatId.clear();
  nextIds.user = 1;
  nextIds.chat = 1;
}

export function findUserById(userId: number): User | undefined {
  return [...usersByLogin.values()].find((candidate) => candidate.id === userId);
}

export function findUserBySession(request: Request): User | undefined {
  const sessionId = request.cookies[sessionCookieName] as string | undefined;

  if (!sessionId) {
    return undefined;
  }

  const userId = sessionsById.get(sessionId);

  if (!userId) {
    return undefined;
  }

  return findUserById(userId);
}

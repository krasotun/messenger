import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { Chat } from './chat';
import { ChatUser } from './chat-user';

export interface CreateChatInput {
  title: string;
}

export interface CreateChatResult {
  id: number;
}

export interface DeleteChatInput {
  chatId: number;
}

export interface AddChatUserInput {
  chatId: number;
  userId: number;
}

export interface AddChatUserResult {
  userAdded: boolean;
}

export interface RemoveChatUserInput {
  chatId: number;
  userId: number;
}

export interface ChatGateway {
  chats(): Observable<Chat[]>;
  createChat(createChatInput: CreateChatInput): Observable<CreateChatResult>;
  deleteChat(deleteChatInput: DeleteChatInput): Observable<void>;
  chatUsers(chatId: number): Observable<ChatUser[]>;
  addChatUser(addChatUserInput: AddChatUserInput): Observable<AddChatUserResult>;
  removeChatUser(removeChatUserInput: RemoveChatUserInput): Observable<void>;
}

export const CHAT_GATEWAY = new InjectionToken<ChatGateway>('CHAT_GATEWAY');

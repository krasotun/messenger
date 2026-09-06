import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { AddChatUserInput } from './add-chat-user/add-chat-user-input.type';
import { AddChatUserResult } from './add-chat-user/add-chat-user-result.type';
import { ChatUser } from './chat-user.type';
import { Chat } from './chat.type';
import { CreateChatInput } from './create-chat/create-chat-input.type';
import { CreateChatResult } from './create-chat/create-chat-result.type';

export interface ChatGateway {
  chats(): Observable<Chat[]>;
  createChat(createChatInput: CreateChatInput): Observable<CreateChatResult>;
  chatUsers(chatId: number): Observable<ChatUser[]>;
  addChatUser(addChatUserInput: AddChatUserInput): Observable<AddChatUserResult>;
}

export const CHAT_GATEWAY = new InjectionToken<ChatGateway>('CHAT_GATEWAY');

import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { AddChatUserInput } from './add-chat-user/add-chat-user.input';
import { AddChatUserResult } from './add-chat-user/add-chat-user.result';
import { Chat } from './chat';
import { ChatUser } from './chat-user';
import { CreateChatInput } from './create-chat/create-chat.input';
import { CreateChatResult } from './create-chat/create-chat.result';

export interface ChatGateway {
  chats(): Observable<Chat[]>;
  createChat(createChatInput: CreateChatInput): Observable<CreateChatResult>;
  chatUsers(chatId: number): Observable<ChatUser[]>;
  addChatUser(addChatUserInput: AddChatUserInput): Observable<AddChatUserResult>;
}

export const CHAT_GATEWAY = new InjectionToken<ChatGateway>('CHAT_GATEWAY');

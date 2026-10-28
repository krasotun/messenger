import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { AddChatUserInput } from './add-chat-user-input';
import { AddChatUserResult } from './add-chat-user-result';
import { Chat } from './chat';
import { ChatUser } from './chat-user';
import { CreateChatInput } from './create-chat-input';
import { CreateChatResult } from './create-chat-result';
import { DeleteChatInput } from './delete-chat-input';

import { RemoveChatUserInput } from '@domains/chats/data/remove-chat-user-input';

export interface ChatGateway {
  chats(): Observable<Chat[]>;
  createChat(createChatInput: CreateChatInput): Observable<CreateChatResult>;
  deleteChat(deleteChatInput: DeleteChatInput): Observable<void>;
  chatUsers(chatId: number): Observable<ChatUser[]>;
  addChatUser(addChatUserInput: AddChatUserInput): Observable<AddChatUserResult>;
  removeChatUser(removeChatUserInput: RemoveChatUserInput): Observable<void>;
}

export const CHAT_GATEWAY = new InjectionToken<ChatGateway>('CHAT_GATEWAY');

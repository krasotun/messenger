import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { AddChatUserInput } from '../application/add-chat-user/add-chat-user.input';
import { AddChatUserResult } from '../application/add-chat-user/add-chat-user.result';
import { Chat } from '../application/chat';
import { ChatUser } from '../application/chat-user';
import { ChatGateway } from '../application/chat.gateway';
import { CreateChatInput } from '../application/create-chat/create-chat.input';
import { CreateChatResult } from '../application/create-chat/create-chat.result';

import { ChatApi } from './chat.api';
import { chatMapper, chatUserMapper } from './chat.mapper';
import { CHAT_ERROR_MESSAGES } from './error-messages';

import { RESOURCES_BASE_URL } from '@core/tokens';
import { toApplicationError } from '@shared/errors';

@Injectable()
export class HttpChatGateway implements ChatGateway {
  private readonly _chatApi = inject(ChatApi);
  private readonly _resourcesBaseUrl = inject(RESOURCES_BASE_URL);

  chats(): Observable<Chat[]> {
    return this._chatApi.chats().pipe(
      map((response) => {
        return response.map((chatDto) => chatMapper(chatDto, this._resourcesBaseUrl));
      }),
      toApplicationError(CHAT_ERROR_MESSAGES.chats),
    );
  }

  createChat({ title }: CreateChatInput): Observable<CreateChatResult> {
    return this._chatApi.createChat({ title }).pipe(
      map((response) => ({ id: response.id })),
      toApplicationError(CHAT_ERROR_MESSAGES.createChat),
    );
  }

  chatUsers(chatId: number): Observable<ChatUser[]> {
    return this._chatApi.chatUsers(chatId).pipe(
      map((response) => {
        return response.map((chatUserDto) => chatUserMapper(chatUserDto, this._resourcesBaseUrl));
      }),
      toApplicationError(CHAT_ERROR_MESSAGES.chatUsers),
    );
  }

  addChatUser({ chatId, userId }: AddChatUserInput): Observable<AddChatUserResult> {
    return this._chatApi.addChatUser({ chatId, users: [userId] }).pipe(
      map(() => ({ userAdded: true })),
      toApplicationError(CHAT_ERROR_MESSAGES.addChatUser),
    );
  }
}

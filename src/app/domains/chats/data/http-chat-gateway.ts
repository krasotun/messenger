import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { Chat } from './chat';
import {
  AddChatUserResult,
  AddChatUserInput,
  ChatGateway,
  CreateChatInput,
  CreateChatResult,
  DeleteChatInput,
  RemoveChatUserInput,
} from './chat-gateway';
import { ChatUser } from './chat-user';
import { ChatApi } from './internal/chat-api';
import { chatMapper, chatUserMapper } from './internal/chat-mapper';
import { CHAT_ERROR_MESSAGES } from './internal/error-messages';

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

  deleteChat({ chatId }: DeleteChatInput): Observable<void> {
    return this._chatApi
      .deleteChat({ chatId })
      .pipe(toApplicationError(CHAT_ERROR_MESSAGES.deleteChat));
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

  removeChatUser({ chatId, userId }: RemoveChatUserInput): Observable<void> {
    return this._chatApi.removeChatUser({ chatId, users: [userId] }).pipe(
      map(() => undefined),
      toApplicationError(CHAT_ERROR_MESSAGES.removeChatUser),
    );
  }
}

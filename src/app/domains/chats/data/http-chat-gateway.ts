import { HttpClient } from '@angular/common/http';
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
import {
  ChatDto,
  ChatUserDto,
  CreateChatRequestDto,
  CreateChatResponseDto,
  DeleteChatRequestDto,
  UsersRequestDto,
} from './internal/chat-dto';
import { chatMapper, chatUserMapper } from './internal/chat-mapper';
import { CHAT_ERROR_MESSAGES } from './internal/error-messages';

import { RESOURCES_BASE_URL } from '@core/tokens';
import { toApplicationError } from '@shared/errors';

@Injectable()
export class HttpChatGateway implements ChatGateway {
  private readonly _httpClient = inject(HttpClient);
  private readonly _resourcesBaseUrl = inject(RESOURCES_BASE_URL);

  chats(): Observable<Chat[]> {
    return this._httpClient.get<ChatDto[]>('/chats').pipe(
      map((response) => {
        return response.map((chatDto) => chatMapper(chatDto, this._resourcesBaseUrl));
      }),
      toApplicationError(CHAT_ERROR_MESSAGES.chats),
    );
  }

  createChat({ title }: CreateChatInput): Observable<CreateChatResult> {
    const request: CreateChatRequestDto = { title };

    return this._httpClient.post<CreateChatResponseDto>('/chats', request).pipe(
      map((response) => ({ id: response.id })),
      toApplicationError(CHAT_ERROR_MESSAGES.createChat),
    );
  }

  deleteChat({ chatId }: DeleteChatInput): Observable<void> {
    const request: DeleteChatRequestDto = { chatId };

    return this._httpClient
      .delete<void>('/chats', { body: request })
      .pipe(toApplicationError(CHAT_ERROR_MESSAGES.deleteChat));
  }

  chatUsers(chatId: number): Observable<ChatUser[]> {
    return this._httpClient.get<ChatUserDto[]>(`/chats/${chatId}/users`).pipe(
      map((response) => {
        return response.map((chatUserDto) => chatUserMapper(chatUserDto, this._resourcesBaseUrl));
      }),
      toApplicationError(CHAT_ERROR_MESSAGES.chatUsers),
    );
  }

  addChatUser({ chatId, userId }: AddChatUserInput): Observable<AddChatUserResult> {
    const request: UsersRequestDto = { chatId, users: [userId] };

    // У ответа в swagger нет JSON-тела, бэкенд присылает текст «OK».
    return this._httpClient.put('/chats/users', request, { responseType: 'text' }).pipe(
      map(() => ({ userAdded: true })),
      toApplicationError(CHAT_ERROR_MESSAGES.addChatUser),
    );
  }

  removeChatUser({ chatId, userId }: RemoveChatUserInput): Observable<void> {
    const request: UsersRequestDto = { chatId, users: [userId] };

    return this._httpClient.delete('/chats/users', { body: request, responseType: 'text' }).pipe(
      map(() => undefined),
      toApplicationError(CHAT_ERROR_MESSAGES.removeChatUser),
    );
  }
}

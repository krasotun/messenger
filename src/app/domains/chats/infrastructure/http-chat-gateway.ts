import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';

import { AddChatUserInput } from '../application/add-chat-user/add-chat-user.input';
import { AddChatUserResult } from '../application/add-chat-user/add-chat-user.result';
import { Chat } from '../application/chat';
import { ChatUser } from '../application/chat-user';
import { ChatGateway } from '../application/chat.gateway';
import { CreateChatInput } from '../application/create-chat/create-chat.input';
import { CreateChatResult } from '../application/create-chat/create-chat.result';

import { ChatApi } from './chat.api';
import { chatMapper, chatUserMapper } from './chat.mapper';

import { RESOURCES_BASE_URL } from '@core/tokens';
import { mapHttpError } from '@shared/errors';

@Injectable()
export class HttpChatGateway implements ChatGateway {
  private readonly _chatApi = inject(ChatApi);
  private readonly _resourcesBaseUrl = inject(RESOURCES_BASE_URL);

  chats(): Observable<Chat[]> {
    return this._chatApi.chats().pipe(
      map((response) => {
        return response.map((chatDto) => chatMapper(chatDto, this._resourcesBaseUrl));
      }),
      catchError((error) => {
        return throwError(() => mapHttpError(error, 'Failed to load chats. Please try again.'));
      }),
    );
  }

  createChat({ title }: CreateChatInput): Observable<CreateChatResult> {
    return this._chatApi.createChat({ title }).pipe(
      map((response) => ({ id: response.id })),
      catchError((error) => {
        return throwError(() => mapHttpError(error, 'Failed to create chat. Please try again.'));
      }),
    );
  }

  chatUsers(chatId: number): Observable<ChatUser[]> {
    return this._chatApi.chatUsers(chatId).pipe(
      map((response) => {
        return response.map((chatUserDto) => chatUserMapper(chatUserDto, this._resourcesBaseUrl));
      }),
      catchError((error) => {
        return throwError(() =>
          mapHttpError(error, 'Failed to load chat members. Please try again.'),
        );
      }),
    );
  }

  addChatUser({ chatId, userId }: AddChatUserInput): Observable<AddChatUserResult> {
    return this._chatApi.addChatUser({ chatId, users: [userId] }).pipe(
      map(() => ({ userAdded: true })),
      catchError((error) => {
        return throwError(() =>
          mapHttpError(error, 'Failed to add chat member. Please try again.'),
        );
      }),
    );
  }
}

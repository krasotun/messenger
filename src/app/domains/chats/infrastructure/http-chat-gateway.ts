import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';

import { Chat } from '../application/chat';
import { ChatGateway } from '../application/chat.gateway';
import { CreateChatInput } from '../application/create-chat/create-chat.input';
import { CreateChatResult } from '../application/create-chat/create-chat.result';

import { mapChatError } from './chat-error.mapper';
import { ChatApi } from './chat.api';
import { chatMapper } from './chat.mapper';

import { RESOURCES_BASE_URL } from '@core/tokens';

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
        return throwError(() => mapChatError(error, 'Failed to load chats. Please try again.'));
      }),
    );
  }

  createChat({ title }: CreateChatInput): Observable<CreateChatResult> {
    return this._chatApi.createChat({ title }).pipe(
      map((response) => ({ id: response.id })),
      catchError((error) => {
        return throwError(() => mapChatError(error, 'Failed to create chat. Please try again.'));
      }),
    );
  }
}

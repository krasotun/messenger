import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  UsersRequestDto,
  ChatDto,
  ChatUserDto,
  CreateChatRequestDto,
  CreateChatResponseDto,
  DeleteChatRequestDto,
} from './chat-dto.type';

@Injectable({
  providedIn: 'root',
})
export class ChatApi {
  private readonly _httpClient = inject(HttpClient);

  chats(): Observable<ChatDto[]> {
    return this._httpClient.get<ChatDto[]>('/chats');
  }

  createChat(request: CreateChatRequestDto): Observable<CreateChatResponseDto> {
    return this._httpClient.post<CreateChatResponseDto>('/chats', request);
  }

  chatUsers(chatId: number): Observable<ChatUserDto[]> {
    return this._httpClient.get<ChatUserDto[]>(`/chats/${chatId}/users`);
  }

  deleteChat(request: DeleteChatRequestDto): Observable<void> {
    return this._httpClient.delete<void>('/chats', { body: request });
  }

  addChatUser(request: UsersRequestDto): Observable<string> {
    return this._httpClient.put('/chats/users', request, {
      responseType: 'text',
    });
  }

  removeChatUser(request: UsersRequestDto): Observable<string> {
    return this._httpClient.delete('/chats/users', {
      body: request,
      responseType: 'text',
    });
  }
}

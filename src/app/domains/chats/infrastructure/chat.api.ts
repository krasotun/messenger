import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ChatDto, CreateChatRequestDto, CreateChatResponseDto } from './chat.dto';

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
}

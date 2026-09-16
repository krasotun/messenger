import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CHAT_GATEWAY } from '../chat.gateway';
import { Chat } from '../chat.type';

@Injectable({
  providedIn: 'root',
})
export class SearchChatsService {
  private readonly _chatGateway = inject(CHAT_GATEWAY);

  // Состояние поиска здесь не живет: ввод, задержка и отмена предыдущего
  // запроса - забота вызывающего экрана, а не use case.
  searchChats(title: string): Observable<Chat[]> {
    return this._chatGateway.chats({ title });
  }
}

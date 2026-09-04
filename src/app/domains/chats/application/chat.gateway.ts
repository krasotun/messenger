import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { Chat } from './chat';

export interface ChatGateway {
  chats(): Observable<Chat[]>;
}

export const CHAT_GATEWAY = new InjectionToken<ChatGateway>('CHAT_GATEWAY');

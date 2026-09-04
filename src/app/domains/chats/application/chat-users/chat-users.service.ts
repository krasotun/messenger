import { computed, inject, Injectable, signal } from '@angular/core';

import { ChatUser } from '../chat-user';
import { CHAT_GATEWAY } from '../chat.gateway';

import { ChatUsersStatus } from './chat-users-status';

import { ApplicationError } from '@shared/errors';
import { Nullable } from '@shared/types';

@Injectable({
  providedIn: 'root',
})
export class ChatUsersService {
  private readonly _chatGateway = inject(CHAT_GATEWAY);

  private readonly _status = signal<ChatUsersStatus>(ChatUsersStatus.Idle);
  readonly status = this._status.asReadonly();

  private readonly _chatUsers = signal<ChatUser[]>([]);
  readonly chatUsers = this._chatUsers.asReadonly();

  private readonly _errorMessage = signal<Nullable<string>>(null);
  readonly errorMessage = this._errorMessage.asReadonly();

  readonly isLoading = computed(() => this._status() === ChatUsersStatus.Loading);

  loadChatUsers(chatId: number): void {
    this._status.set(ChatUsersStatus.Loading);
    this._errorMessage.set(null);

    this._chatGateway.chatUsers(chatId).subscribe({
      next: (chatUsers) => {
        this._chatUsers.set(chatUsers);
        this._status.set(ChatUsersStatus.Loaded);
      },
      error: ({ message }: ApplicationError) => {
        this._errorMessage.set(message);
        this._status.set(ChatUsersStatus.Error);
      },
    });
  }
}

import { computed, inject, Injectable, signal } from '@angular/core';

import { Chat } from '../chat';
import { CHAT_GATEWAY } from '../chat.gateway';

import { ChatListStatus } from './chat-list-status';

import { ApplicationError } from '@shared/errors';
import { Nullable } from '@shared/types';

@Injectable({
  providedIn: 'root',
})
export class ChatListService {
  private readonly _chatGateway = inject(CHAT_GATEWAY);

  private readonly _status = signal<ChatListStatus>(ChatListStatus.Idle);
  readonly status = this._status.asReadonly();

  private readonly _chats = signal<Chat[]>([]);
  readonly chats = this._chats.asReadonly();

  private readonly _errorMessage = signal<Nullable<string>>(null);
  readonly errorMessage = this._errorMessage.asReadonly();

  readonly isLoading = computed(() => this._status() === ChatListStatus.Loading);

  // Пустота - это состояние загруженного списка, а не отсутствие данных:
  // до ответа и после ошибки показывать «чатов еще нет» нельзя.
  readonly isEmpty = computed(
    () => this._status() === ChatListStatus.Loaded && this._chats().length === 0,
  );

  loadChats(): void {
    this._status.set(ChatListStatus.Loading);
    this._errorMessage.set(null);

    this._chatGateway.chats().subscribe({
      next: (chats) => {
        this._chats.set(chats);
        this._status.set(ChatListStatus.Loaded);
      },
      error: ({ message }: ApplicationError) => {
        this._errorMessage.set(message);
        this._status.set(ChatListStatus.Error);
      },
    });
  }
}

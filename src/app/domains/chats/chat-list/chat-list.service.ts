import { computed, inject, Injectable, signal } from '@angular/core';

import { CHAT_GATEWAY } from '../chat.gateway';
import { Chat } from '../chat.type';

import { ApplicationError } from '@shared/errors';
import { LoadStatus } from '@shared/types';

type ChatListState =
  | { status: LoadStatus.Idle }
  | { status: LoadStatus.Loading }
  | { status: LoadStatus.Loaded; chats: Chat[] }
  | { status: LoadStatus.Error; errorMessage: string };

@Injectable({
  providedIn: 'root',
})
export class ChatListService {
  private readonly _chatGateway = inject(CHAT_GATEWAY);

  private readonly _state = signal<ChatListState>({ status: LoadStatus.Idle });

  readonly status = computed(() => this._state().status);

  readonly chats = computed(() => {
    const state = this._state();

    return state.status === LoadStatus.Loaded ? state.chats : [];
  });

  readonly errorMessage = computed(() => {
    const state = this._state();

    return state.status === LoadStatus.Error ? state.errorMessage : null;
  });

  // Пустота - это состояние загруженного списка, а не отсутствие данных:
  // до ответа и после ошибки показывать «чатов еще нет» нельзя.
  readonly isEmpty = computed(() => {
    const state = this._state();

    return state.status === LoadStatus.Loaded && state.chats.length === 0;
  });

  loadChats(): void {
    this._state.set({ status: LoadStatus.Loading });

    this._chatGateway.chats().subscribe({
      next: (chats) => {
        this._state.set({ status: LoadStatus.Loaded, chats });
      },
      error: ({ message }: ApplicationError) => {
        this._state.set({ status: LoadStatus.Error, errorMessage: message });
      },
    });
  }
}

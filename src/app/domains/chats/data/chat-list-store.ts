import { computed, inject, Injectable, signal } from '@angular/core';

import { Chat } from '@domains/chats/data/chat';
import { CHAT_GATEWAY } from '@domains/chats/data/chat-gateway';
import { CreateChatInput } from '@domains/chats/data/create-chat-input';
import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
import { createFormSubmitFlowState } from '@shared/submit-flow';
import { LoadStatus } from '@shared/types';

type ChatListState =
  | { status: LoadStatus.Idle }
  | { status: LoadStatus.Loading }
  | { status: LoadStatus.Loaded; chats: Chat[] }
  | { status: LoadStatus.Error; errorMessage: string };

@Injectable({ providedIn: 'root' })
export class ChatListStore {
  private readonly _chatGateway = inject(CHAT_GATEWAY);
  private readonly _notifier = inject(NOTIFIER);

  private readonly _chatCreationFlow = createFormSubmitFlowState();

  readonly chatCreationFlow = {
    isSubmitting: this._chatCreationFlow.isSubmitting,
    succeeded$: this._chatCreationFlow.succeeded$,
  };

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

  createChat(createChatInput: CreateChatInput): void {
    this._chatCreationFlow.startSubmitting();

    this._chatGateway.createChat(createChatInput).subscribe({
      next: () => {
        this.loadChats();
        this._chatCreationFlow.markSuccess();
      },
      error: ({ message }: ApplicationError) => {
        this._chatCreationFlow.markError();
        this._notifier.error('Failed to create chat', message);
      },
    });
  }

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

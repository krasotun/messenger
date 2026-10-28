import { inject, Injectable, signal } from '@angular/core';

import { Chat } from '@domains/chats/data/chat';
import { CHAT_GATEWAY } from '@domains/chats/data/chat-gateway';
import { CreateChatInput } from '@domains/chats/data/create-chat-input';
import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
import { createFormSubmitFlowState } from '@shared/submit-flow';

@Injectable({ providedIn: 'root' })
export class ChatListStore {
  private readonly _chatGateway = inject(CHAT_GATEWAY);
  private readonly _notifier = inject(NOTIFIER);

  private readonly _chatCreationFlow = createFormSubmitFlowState();

  readonly chatCreationFlow = {
    isSubmitting: this._chatCreationFlow.isSubmitting,
    succeeded$: this._chatCreationFlow.succeeded$,
  };

  private readonly _chats = signal<Chat[]>([]);
  readonly chats = this._chats.asReadonly();

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
    this._chatGateway.chats().subscribe((chats) => {
      this._chats.set(chats);
    });
  }
}

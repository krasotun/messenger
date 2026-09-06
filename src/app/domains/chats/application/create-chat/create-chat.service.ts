import { computed, inject, Injectable, signal } from '@angular/core';

import { ChatListService } from '../chat-list/chat-list.service';
import { CHAT_GATEWAY } from '../chat.gateway';

import { CreateChatInput } from './create-chat-input.type';
import { CreateChatStatus } from './create-chat-status.type';

import { ApplicationError } from '@shared/errors';
import { Nullable } from '@shared/types';

@Injectable()
export class CreateChatService {
  private readonly _chatGateway = inject(CHAT_GATEWAY);
  private readonly _chatListService = inject(ChatListService);

  private readonly _status = signal<CreateChatStatus>(CreateChatStatus.Idle);
  readonly status = this._status.asReadonly();

  private readonly _errorMessage = signal<Nullable<string>>(null);
  readonly errorMessage = this._errorMessage.asReadonly();

  readonly isSubmitting = computed(() => this._status() === CreateChatStatus.Submitting);

  createChat(createChatInput: CreateChatInput): void {
    this._status.set(CreateChatStatus.Submitting);
    this._errorMessage.set(null);

    this._chatGateway.createChat(createChatInput).subscribe({
      next: () => {
        this._chatListService.loadChats();
        this._status.set(CreateChatStatus.Success);
      },
      error: ({ message }: ApplicationError) => {
        this._status.set(CreateChatStatus.Error);
        this._errorMessage.set(message);
      },
    });
  }

  reset(): void {
    this._status.set(CreateChatStatus.Idle);
    this._errorMessage.set(null);
  }
}

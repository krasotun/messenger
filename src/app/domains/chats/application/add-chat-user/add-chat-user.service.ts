import { computed, inject, Injectable, signal } from '@angular/core';

import { ChatUsersService } from '../chat-users/chat-users.service';
import { CHAT_GATEWAY } from '../chat.gateway';

import { AddChatUserStatus } from './add-chat-user-status';
import { AddChatUserInput } from './add-chat-user.input';

import { ApplicationError } from '@shared/errors';
import { Nullable } from '@shared/types';

@Injectable()
export class AddChatUserService {
  private readonly _chatGateway = inject(CHAT_GATEWAY);
  private readonly _chatUsersService = inject(ChatUsersService);

  private readonly _status = signal<AddChatUserStatus>(AddChatUserStatus.Idle);
  readonly status = this._status.asReadonly();

  private readonly _errorMessage = signal<Nullable<string>>(null);
  readonly errorMessage = this._errorMessage.asReadonly();

  readonly isSubmitting = computed(() => this._status() === AddChatUserStatus.Submitting);

  addChatUser(addChatUserInput: AddChatUserInput): void {
    this._status.set(AddChatUserStatus.Submitting);
    this._errorMessage.set(null);

    this._chatGateway.addChatUser(addChatUserInput).subscribe({
      next: () => {
        this._chatUsersService.loadChatUsers(addChatUserInput.chatId);
        this._status.set(AddChatUserStatus.Success);
      },
      error: ({ message }: ApplicationError) => {
        this._status.set(AddChatUserStatus.Error);
        this._errorMessage.set(message);
      },
    });
  }

  reset(): void {
    this._status.set(AddChatUserStatus.Idle);
    this._errorMessage.set(null);
  }
}

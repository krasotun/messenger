import { computed, inject, Injectable, signal } from '@angular/core';

import { ChatUsersService } from '../chat-users/chat-users.service';
import { CHAT_GATEWAY } from '../chat.gateway';

import { AddChatUserInput } from './add-chat-user-input.type';
import { AddChatUserStatus } from './add-chat-user-status.type';

import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';

@Injectable()
export class AddChatUserService {
  private readonly _chatGateway = inject(CHAT_GATEWAY);
  private readonly _chatUsersService = inject(ChatUsersService);
  private readonly _notifier = inject(NOTIFIER);

  private readonly _status = signal<AddChatUserStatus>(AddChatUserStatus.Idle);
  readonly status = this._status.asReadonly();

  readonly isSubmitting = computed(() => this._status() === AddChatUserStatus.Submitting);

  addChatUser(addChatUserInput: AddChatUserInput): void {
    this._status.set(AddChatUserStatus.Submitting);

    this._chatGateway.addChatUser(addChatUserInput).subscribe({
      next: () => {
        this._chatUsersService.loadChatUsers(addChatUserInput.chatId);
        this._status.set(AddChatUserStatus.Success);
      },
      error: ({ message }: ApplicationError) => {
        this._status.set(AddChatUserStatus.Error);
        this._notifier.error('Failed to add chat user', message);
      },
    });
  }

  reset(): void {
    this._status.set(AddChatUserStatus.Idle);
  }
}

import { inject, Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

import { ChatUsersService } from '../chat-users/chat-users.service';
import { CHAT_GATEWAY } from '../chat.gateway';

import { AddChatUserInput } from './add-chat-user-input.type';

import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';

@Injectable()
export class AddChatUserService {
  private readonly _chatGateway = inject(CHAT_GATEWAY);
  private readonly _chatUsersService = inject(ChatUsersService);
  private readonly _notifier = inject(NOTIFIER);

  private readonly _isSubmitting = signal(false);
  private readonly _succeeded = new Subject<void>();

  readonly isSubmitting = this._isSubmitting.asReadonly();

  readonly succeeded$ = this._succeeded.asObservable();

  addChatUser(addChatUserInput: AddChatUserInput): void {
    this._isSubmitting.set(true);

    this._chatGateway.addChatUser(addChatUserInput).subscribe({
      next: () => {
        this._chatUsersService.loadChatUsers(addChatUserInput.chatId);
        this._isSubmitting.set(false);
        this._succeeded.next();
      },
      error: ({ message }: ApplicationError) => {
        this._isSubmitting.set(false);
        this._notifier.error('Failed to add chat user', message);
      },
    });
  }
}

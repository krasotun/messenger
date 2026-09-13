import { inject, Injectable } from '@angular/core';

import { ChatUsersService } from '../chat-users/chat-users.service';
import { CHAT_GATEWAY } from '../chat.gateway';

import { AddChatUserInput } from './add-chat-user-input.type';

import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
import { createFormSubmitFlowState } from '@shared/submit-flow';

@Injectable()
export class AddChatUserService {
  private readonly _chatGateway = inject(CHAT_GATEWAY);
  private readonly _chatUsersService = inject(ChatUsersService);
  private readonly _notifier = inject(NOTIFIER);

  private readonly _flow = createFormSubmitFlowState();

  readonly isSubmitting = this._flow.isSubmitting;

  readonly succeeded$ = this._flow.succeeded$;

  addChatUser(addChatUserInput: AddChatUserInput): void {
    this._flow.startSubmitting();

    this._chatGateway.addChatUser(addChatUserInput).subscribe({
      next: () => {
        this._chatUsersService.loadChatUsers(addChatUserInput.chatId);
        this._flow.markSuccess();
      },
      error: ({ message }: ApplicationError) => {
        this._flow.markError();
        this._notifier.error('Failed to add chat user', message);
      },
    });
  }
}

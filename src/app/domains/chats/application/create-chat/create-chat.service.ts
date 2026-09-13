import { inject, Injectable } from '@angular/core';

import { ChatListService } from '../chat-list/chat-list.service';
import { CHAT_GATEWAY } from '../chat.gateway';

import { CreateChatInput } from './create-chat-input.type';

import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
import { createFormSubmitFlowState } from '@shared/submit-flow';

@Injectable()
export class CreateChatService {
  private readonly _chatGateway = inject(CHAT_GATEWAY);
  private readonly _chatListService = inject(ChatListService);
  private readonly _notifier = inject(NOTIFIER);

  private readonly _flow = createFormSubmitFlowState();

  readonly isSubmitting = this._flow.isSubmitting;

  readonly succeeded$ = this._flow.succeeded$;

  createChat(createChatInput: CreateChatInput): void {
    this._flow.startSubmitting();

    this._chatGateway.createChat(createChatInput).subscribe({
      next: () => {
        this._chatListService.loadChats();
        this._flow.markSuccess();
      },
      error: ({ message }: ApplicationError) => {
        this._flow.markError();
        this._notifier.error('Failed to create chat', message);
      },
    });
  }
}

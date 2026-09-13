import { inject, Injectable } from '@angular/core';

import { ChatListService } from '../chat-list/chat-list.service';
import { CHAT_GATEWAY } from '../chat.gateway';

import { DeleteChatInput } from './delete-chat-input.type';

import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
import { createFormSubmitFlowState } from '@shared/submit-flow';

@Injectable()
export class DeleteChatService {
  private readonly _chatGateway = inject(CHAT_GATEWAY);
  private readonly _chatListService = inject(ChatListService);
  private readonly _notifier = inject(NOTIFIER);

  private readonly _flow = createFormSubmitFlowState();

  readonly isSubmitting = this._flow.isSubmitting;

  readonly succeeded$ = this._flow.succeeded$;

  deleteChat(deleteChatInput: DeleteChatInput): void {
    this._flow.startSubmitting();

    this._chatGateway.deleteChat(deleteChatInput).subscribe({
      next: () => {
        this._chatListService.loadChats();
        this._flow.markSuccess();
        this._notifier.success('Delete chat', 'Chat deleted successfully');
      },
      error: ({ message }: ApplicationError) => {
        this._flow.markError();
        this._notifier.error('Failed to delete chat', message);
      },
    });
  }
}

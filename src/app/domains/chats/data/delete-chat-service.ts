import { inject, Injectable } from '@angular/core';

import { CHAT_GATEWAY } from './chat-gateway';
import { ChatListStore } from './chat-list-store';
import { DeleteChatInput } from './delete-chat-input';

import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
import { createActionFlowState } from '@shared/submit-flow';

@Injectable()
export class DeleteChatService {
  private readonly _chatGateway = inject(CHAT_GATEWAY);
  private readonly _chatListStore = inject(ChatListStore);
  private readonly _notifier = inject(NOTIFIER);

  private readonly _flow = createActionFlowState();

  readonly succeeded$ = this._flow.succeeded$;

  deleteChat(deleteChatInput: DeleteChatInput): void {
    this._chatGateway.deleteChat(deleteChatInput).subscribe({
      next: () => {
        this._chatListStore.loadChats();
        this._flow.markSuccess();
        this._notifier.success('Delete chat', 'Chat deleted successfully');
      },
      error: ({ message }: ApplicationError) => {
        this._notifier.error('Failed to delete chat', message);
      },
    });
  }
}

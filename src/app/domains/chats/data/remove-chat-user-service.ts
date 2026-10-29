import { inject, Injectable } from '@angular/core';

import { CHAT_GATEWAY, RemoveChatUserInput } from '@domains/chats/data/chat-gateway';
import { ChatUsersService } from '@domains/chats/data/chat-users-service';
import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
import { createActionFlowState } from '@shared/submit-flow';

@Injectable()
export class RemoveChatUserService {
  private readonly _chatGateway = inject(CHAT_GATEWAY);
  private readonly _chatUsersService = inject(ChatUsersService);
  private readonly _notifier = inject(NOTIFIER);

  private readonly _flow = createActionFlowState();

  readonly succeeded$ = this._flow.succeeded$;

  removeChatUser(removeChatUserInput: RemoveChatUserInput): void {
    this._chatGateway.removeChatUser(removeChatUserInput).subscribe({
      next: () => {
        this._flow.markSuccess();
        this._chatUsersService.loadChatUsers(removeChatUserInput.chatId);

        this._notifier.success('Remove member', 'Member removed');
      },

      error: ({ message }: ApplicationError) => {
        this._notifier.error('Failed to remove member', message);
      },
    });
  }
}

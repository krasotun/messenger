import { inject, Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

import { ChatListService } from '../chat-list/chat-list.service';
import { CHAT_GATEWAY } from '../chat.gateway';

import { DeleteChatInput } from './delete-chat-input.type';

import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';

@Injectable()
export class DeleteChatService {
  private readonly _chatGateway = inject(CHAT_GATEWAY);
  private readonly _chatListService = inject(ChatListService);
  private readonly _notifier = inject(NOTIFIER);

  private readonly _isSubmitting = signal(false);
  private readonly _succeeded = new Subject<void>();

  readonly isSubmitting = this._isSubmitting.asReadonly();

  readonly succeeded$ = this._succeeded.asObservable();

  deleteChat(deleteChatInput: DeleteChatInput): void {
    this._isSubmitting.set(true);

    this._chatGateway.deleteChat(deleteChatInput).subscribe({
      next: () => {
        this._chatListService.loadChats();
        this._isSubmitting.set(false);
        this._succeeded.next();
        this._notifier.success('Delete chat', 'Chat deleted successfully');
      },
      error: ({ message }: ApplicationError) => {
        this._isSubmitting.set(false);
        this._notifier.error('Failed to delete chat', message);
      },
    });
  }
}

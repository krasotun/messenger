import { Component, computed, effect, inject, input, numberAttribute, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

import { ChatUsersPanel } from '../chat-users-panel/chat-users-panel';
import { SelectedChatHeader } from '../selected-chat-header/selected-chat-header';

import { ChatListService } from '@domains/chats/application/chat-list/chat-list.service';
import { ChatUser } from '@domains/chats/application/chat-user.type';
import { ChatUsersService } from '@domains/chats/application/chat-users/chat-users.service';
import { DeleteChatService } from '@domains/chats/application/delete-chat/delete-chat.service';
import { RemoveChatUserService } from '@domains/chats/application/remove-chat-user/remove-chat-user.service';
import { CurrentSessionService } from '@domains/identity-access';
import { ConfirmationService } from '@shared/ui/confirmation';

const DELETE_CHAT_MESSAGE =
  "The chat and its messages disappear for every member. This can't be undone.";

@Component({
  selector: 'app-selected-chat',
  imports: [SelectedChatHeader, ChatUsersPanel],
  templateUrl: './selected-chat.html',
  styleUrl: './selected-chat.scss',
  providers: [DeleteChatService, RemoveChatUserService],
})
export class SelectedChat {
  readonly chatId = input.required({
    transform: numberAttribute,
  });

  private readonly _chatUsersService = inject(ChatUsersService);
  private readonly _chatListService = inject(ChatListService);
  private readonly _currentSessionService = inject(CurrentSessionService);
  private readonly _confirmationService = inject(ConfirmationService);
  private readonly _deleteChatService = inject(DeleteChatService);
  private readonly _removeChatUserService = inject(RemoveChatUserService);
  private readonly _router = inject(Router);

  readonly membersOpen = signal(false);

  readonly currentUser = this._currentSessionService.currentUser;

  readonly chat = computed(() => {
    const chatId = this.chatId();

    return this._chatListService.chats().find((chat) => chat.id === chatId) ?? null;
  });

  readonly isChatCreator = computed(() => {
    const chat = this.chat();
    const currentUser = this._currentSessionService.currentUser();

    return !!chat && !!currentUser && chat.createdBy === currentUser.id;
  });

  readonly chatUsers = this._chatUsersService.chatUsers;
  readonly errorMessage = this._chatUsersService.errorMessage;

  constructor() {
    effect(() => {
      this._chatUsersService.loadChatUsers(this.chatId());
    });

    this._deleteChatService.succeeded$.pipe(takeUntilDestroyed()).subscribe(() => {
      this._router.navigateByUrl('/');
    });
  }

  protected toggleChatUsersPanel(): void {
    this.membersOpen.update((currentStatus) => !currentStatus);
  }

  protected closeChatUsersPanel(): void {
    this.membersOpen.set(false);
  }

  protected deleteChat(): void {
    const chat = this.chat();

    if (!chat) {
      return;
    }

    this._confirmationService
      .confirm({
        title: 'Delete chat',
        subject: chat.title,
        message: DELETE_CHAT_MESSAGE,
        confirmLabel: 'Delete',
        isDangerous: true,
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          this._deleteChatService.deleteChat({ chatId: chat.id });
        }
      });
  }

  protected removeChatUser(chatUser: ChatUser): void {
    const chat = this.chat();

    if (!chat) {
      return;
    }

    this._confirmationService
      .confirm({
        title: 'Remove member',
        subject: chatUser.name,
        message: `They leave "${chat.title}" and can be added back later.`,
        confirmLabel: 'Remove',
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          this._removeChatUserService.removeChatUser({ chatId: chat.id, userId: chatUser.id });
        }
      });
  }
}

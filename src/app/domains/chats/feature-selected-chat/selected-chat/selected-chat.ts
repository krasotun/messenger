import { Component, computed, effect, inject, input, numberAttribute, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

import { ChatUsersPanel } from '../../ui/chat-users-panel/chat-users-panel';
import { SelectedChatHeader } from '../selected-chat-header/selected-chat-header';

import { ChatListStore } from '@domains/chats/data/chat-list-store';
import { ChatUser } from '@domains/chats/data/chat-user';
import { ChatUsersStore } from '@domains/chats/data/chat-users-store';
import { CurrentSessionService } from '@domains/users';
import { ConfirmationService } from '@shared/ui/confirmation';

const DELETE_CHAT_MESSAGE =
  "The chat and its messages disappear for every member. This can't be undone.";

@Component({
  selector: 'app-selected-chat',
  imports: [SelectedChatHeader, ChatUsersPanel],
  templateUrl: './selected-chat.html',
  styleUrl: './selected-chat.scss',
  providers: [ChatUsersStore],
})
export class SelectedChat {
  readonly chatId = input.required({
    transform: numberAttribute,
  });

  private readonly _chatUsersStore = inject(ChatUsersStore);
  private readonly _chatListStore = inject(ChatListStore);
  private readonly _currentSessionService = inject(CurrentSessionService);
  private readonly _confirmationService = inject(ConfirmationService);
  private readonly _router = inject(Router);

  readonly membersOpen = signal(false);

  readonly currentUser = this._currentSessionService.currentUser;

  readonly chat = computed(() => {
    const chatId = this.chatId();

    return this._chatListStore.chats().find((chat) => chat.id === chatId) ?? null;
  });

  readonly isChatCreator = computed(() => {
    const chat = this.chat();
    const currentUser = this._currentSessionService.currentUser();

    return !!chat && !!currentUser && chat.createdBy === currentUser.id;
  });

  readonly chatUsers = this._chatUsersStore.chatUsers;
  readonly errorMessage = this._chatUsersStore.errorMessage;

  constructor() {
    effect(() => {
      this._chatUsersStore.loadChatUsers(this.chatId());
    });

    this._chatListStore.chatDeletionFlow.succeeded$.pipe(takeUntilDestroyed()).subscribe(() => {
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
          this._chatListStore.deleteChat({ chatId: chat.id });
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
          this._chatUsersStore.removeChatUser({ chatId: chat.id, userId: chatUser.id });
        }
      });
  }
}

import {
  Component,
  computed,
  effect,
  inject,
  input,
  numberAttribute,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

import { ChatListService } from '../../application/chat-list/chat-list.service';
import { ChatUsersService } from '../../application/chat-users/chat-users.service';
import { DeleteChatService } from '../../application/delete-chat/delete-chat.service';
import { AddChatUserPanel } from '../add-chat-user-panel/add-chat-user-panel';
import { ChatUserStack } from '../chat-user-stack/chat-user-stack';

import { CurrentSessionService } from '@domains/identity-access';
import { Avatar } from '@shared/ui/avatar/avatar';
import { Button } from '@shared/ui/button/button';
import { ConfirmationService } from '@shared/ui/confirmation';
import { Popover } from '@shared/ui/popover/popover';

const DELETE_CHAT_MESSAGE =
  "The chat and its messages disappear for every member. This can't be undone.";

@Component({
  selector: 'app-selected-chat-header',
  imports: [Avatar, ChatUserStack, AddChatUserPanel, Button, Popover],
  templateUrl: './selected-chat-header.html',
  styleUrl: './selected-chat-header.scss',
  providers: [DeleteChatService],
})
export class SelectedChatHeader {
  readonly chatId = input.required({
    transform: numberAttribute,
  });

  private readonly _chatUsersService = inject(ChatUsersService);
  private readonly _chatListService = inject(ChatListService);
  private readonly _currentSessionService = inject(CurrentSessionService);
  private readonly _confirmationService = inject(ConfirmationService);
  private readonly _deleteChatService = inject(DeleteChatService);
  private readonly _router = inject(Router);

  private readonly _addUserPopover = viewChild(Popover);

  readonly chat = computed(() => {
    const chatId = this.chatId();

    return this._chatListService.chats().find((chat) => chat.id === chatId) ?? null;
  });

  readonly chatUsers = this._chatUsersService.chatUsers;
  readonly errorMessage = this._chatUsersService.errorMessage;

  readonly avatarLabel = computed(() => `Avatar ${this.chat()?.title ?? ''}`);
  readonly avatarFallbackText = computed(() => this.chat()?.title.trim()[0]?.toUpperCase() ?? '');

  readonly canDeleteChat = computed(() => {
    const chat = this.chat();
    const currentUser = this._currentSessionService.currentUser();

    return !!chat && !!currentUser && chat.createdBy === currentUser.id;
  });

  constructor() {
    // Роут переиспользует этот компонент при переходе между чатами: без
    // effect на chatId состав участников остался бы от предыдущего чата.
    effect(() => {
      this._chatUsersService.loadChatUsers(this.chatId());
    });

    this._deleteChatService.succeeded$.pipe(takeUntilDestroyed()).subscribe(() => {
      this._router.navigateByUrl('/');
    });
  }

  protected closeAddUserPopover(): void {
    this._addUserPopover()?.close();
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
}

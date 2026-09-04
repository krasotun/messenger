import { Component, computed, effect, inject, input, viewChild } from '@angular/core';

import { ChatListService } from '../../application/chat-list/chat-list.service';
import { ChatUsersService } from '../../application/chat-users/chat-users.service';
import { AddChatUserPanel } from '../add-chat-user-panel/add-chat-user-panel';
import { ChatUserStack } from '../chat-user-stack/chat-user-stack';

import { Avatar } from '@shared/ui/avatar/avatar';
import { Button } from '@shared/ui/button/button';
import { Popover } from '@shared/ui/popover/popover';

@Component({
  selector: 'app-selected-chat-header',
  imports: [Avatar, ChatUserStack, AddChatUserPanel, Button, Popover],
  templateUrl: './selected-chat-header.html',
  styleUrl: './selected-chat-header.scss',
})
export class SelectedChatHeader {
  readonly chatId = input.required<string>();

  private readonly _chatUsersService = inject(ChatUsersService);
  private readonly _chatListService = inject(ChatListService);

  private readonly _addUserPopover = viewChild(Popover);

  readonly numericChatId = computed(() => Number(this.chatId()));

  readonly chat = computed(() => {
    const numericChatId = this.numericChatId();

    return this._chatListService.chats().find((chat) => chat.id === numericChatId) ?? null;
  });

  readonly chatUsers = this._chatUsersService.chatUsers;
  readonly errorMessage = this._chatUsersService.errorMessage;

  readonly avatarLabel = computed(() => `Avatar ${this.chat()?.title ?? ''}`);
  readonly avatarFallbackText = computed(() => this.chat()?.title.trim()[0]?.toUpperCase() ?? '');

  constructor() {
    // Роут переиспользует этот компонент при переходе между чатами: без
    // effect на chatId состав участников остался бы от предыдущего чата.
    effect(() => {
      this._chatUsersService.loadChatUsers(this.numericChatId());
    });
  }

  protected closeAddUserPopover(): void {
    this._addUserPopover()?.close();
  }
}

import { Component, computed, input, output, viewChild } from '@angular/core';

import { AddChatUserPanel } from '../add-chat-user-panel/add-chat-user-panel';
import { ChatUserStack } from '../chat-user-stack/chat-user-stack';

import { ChatUser } from '@domains/chats/application/chat-user.type';
import { Chat } from '@domains/chats/application/chat.type';
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
  readonly chat = input.required<Chat>();
  readonly isChatCreator = input.required<boolean>();
  readonly chatUsers = input.required<ChatUser[]>();

  readonly deleteRequested = output<void>();

  readonly avatarLabel = computed(() => `Avatar ${this.chat().title}`);

  private readonly _addUserPopover = viewChild(Popover);

  protected closeAddUserPopover(): void {
    this._addUserPopover()?.close();
  }
}

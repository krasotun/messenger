import { Component, computed, input, output, viewChild } from '@angular/core';
import { ButtonDirective } from 'primeng/button';

import { ChatUserStack } from '../../ui/chat-user-stack/chat-user-stack';
import { AddChatUserPanel } from '../add-chat-user-panel/add-chat-user-panel';

import { Chat } from '@domains/chats/data/chat';
import { ChatUser } from '@domains/chats/data/chat-user';
import { Avatar } from '@shared/ui/avatar/avatar';
import { Popover } from '@shared/ui/popover/popover';

@Component({
  selector: 'app-selected-chat-header',
  imports: [Avatar, ChatUserStack, AddChatUserPanel, ButtonDirective, Popover],
  templateUrl: './selected-chat-header.html',
  styleUrl: './selected-chat-header.scss',
})
export class SelectedChatHeader {
  readonly chat = input.required<Chat>();
  readonly isChatCreator = input.required<boolean>();
  readonly chatUsers = input.required<ChatUser[]>();

  readonly deleteRequested = output<void>();
  readonly membersToggled = output<void>();

  readonly avatarLabel = computed(() => `Avatar ${this.chat().title}`);

  private readonly _addUserPopover = viewChild(Popover);

  protected closeAddUserPopover(): void {
    this._addUserPopover()?.close();
  }
}

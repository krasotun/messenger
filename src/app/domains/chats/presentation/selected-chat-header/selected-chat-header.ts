import { Component, computed, effect, inject, input } from '@angular/core';

import { ChatListService } from '../../application/chat-list/chat-list.service';
import { ChatUsersService } from '../../application/chat-users/chat-users.service';
import { ChatUserStack } from '../chat-user-stack/chat-user-stack';

import { Avatar } from '@shared/ui/avatar/avatar';

@Component({
  selector: 'app-selected-chat-header',
  imports: [Avatar, ChatUserStack],
  templateUrl: './selected-chat-header.html',
  styleUrl: './selected-chat-header.scss',
})
export class SelectedChatHeader {
  readonly chatId = input.required<string>();

  private readonly _chatUsersService = inject(ChatUsersService);
  private readonly _chatListService = inject(ChatListService);

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
}

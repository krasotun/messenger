import { Component, computed, input } from '@angular/core';

import { Chat } from '../../application/chat';

import { Avatar } from '@shared/ui/avatar/avatar';

const noLastMessageText = 'No messages yet';

@Component({
  selector: 'app-chat-list-item',
  imports: [Avatar],
  templateUrl: './chat-list-item.html',
  styleUrl: './chat-list-item.scss',
})
export class ChatListItem {
  readonly chat = input.required<Chat>();

  readonly avatarLabel = computed(() => `Avatar ${this.chat().title}`);
  readonly avatarFallbackText = computed(() => this.chat().title.trim()[0]?.toUpperCase() ?? '');

  readonly lastMessageText = computed(() => {
    const lastMessage = this.chat().lastMessage;

    return lastMessage ? `${lastMessage.authorName}: ${lastMessage.content}` : noLastMessageText;
  });

  readonly hasLastMessage = computed(() => this.chat().lastMessage !== null);
  readonly hasUnread = computed(() => this.chat().unreadCount > 0);
}

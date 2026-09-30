import { Component, computed, input, output } from '@angular/core';

import { ChatUserRow } from '../chat-user-row/chat-user-row';

import { ChatUser } from '@domains/chats/application/chat-user.type';
import { UserId } from '@domains/identity-access';

@Component({
  selector: 'app-chat-users-panel',
  imports: [ChatUserRow],
  templateUrl: './chat-users-panel.html',
  styleUrl: './chat-users-panel.scss',
})
export class ChatUsersPanel {
  readonly chatUsers = input.required<ChatUser[]>();
  readonly currentUserId = input.required<UserId>();

  readonly chatUsersTitle = computed(() => `Members · ${this.chatUsers().length}`);

  readonly closed = output<void>();
}

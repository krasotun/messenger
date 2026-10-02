import { Component, computed, input } from '@angular/core';

import { ChatUser } from '@domains/chats/application/chat-user.type';
import { Avatar } from '@shared/ui/avatar/avatar';

@Component({
  selector: 'app-chat-user-row',
  imports: [Avatar],
  templateUrl: './chat-user-row.html',
  styleUrl: './chat-user-row.scss',
})
export class ChatUserRow {
  readonly user = input.required<ChatUser>();
  readonly isCurrentUser = input.required<boolean>();

  readonly avatarLabel = computed(() => `Avatar ${this.user().name}`);
}

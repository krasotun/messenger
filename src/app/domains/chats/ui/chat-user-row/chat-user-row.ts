import { Component, computed, input, output } from '@angular/core';
import { ButtonDirective } from 'primeng/button';

import { ChatUser } from '@domains/chats/data/chat-user';
import { Avatar } from '@shared/ui/avatar/avatar';

@Component({
  selector: 'app-chat-user-row',
  imports: [Avatar, ButtonDirective],
  templateUrl: './chat-user-row.html',
  styleUrl: './chat-user-row.scss',
})
export class ChatUserRow {
  readonly user = input.required<ChatUser>();
  readonly isCurrentUser = input.required<boolean>();
  readonly canRemove = input.required<boolean>();

  readonly removeButtonLabel = computed(() => `Remove ${this.user().name}`);

  readonly removeRequested = output<void>();

  readonly avatarLabel = computed(() => `Avatar ${this.user().name}`);
}

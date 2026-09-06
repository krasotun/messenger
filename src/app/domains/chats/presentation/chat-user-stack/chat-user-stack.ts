import { Component, computed, input } from '@angular/core';

import { ChatUser } from '../../application/chat-user.type';

import { Avatar } from '@shared/ui/avatar/avatar';

const maxVisibleUsers = 4;

@Component({
  selector: 'app-chat-user-stack',
  imports: [Avatar],
  templateUrl: './chat-user-stack.html',
  styleUrl: './chat-user-stack.scss',
})
export class ChatUserStack {
  readonly users = input.required<ChatUser[]>();

  readonly visibleUsers = computed(() => this.users().slice(0, maxVisibleUsers));
  readonly restCount = computed(() => Math.max(0, this.users().length - maxVisibleUsers));

  protected avatarFallbackText(user: ChatUser): string {
    return user.name.trim()[0]?.toUpperCase() ?? '';
  }
}

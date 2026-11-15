import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';

import { ChatListItem } from '../../ui/chat-list-item/chat-list-item';
import {
  CreateChatDialogData,
  CreateChatModalContent,
} from '../create-chat-modal-content/create-chat-modal-content';

import { ChatListStore } from '@domains/chats/data/chat-list-store';
import { DIALOG_DEFAULTS } from '@shared/ui/dialog/dialog-defaults.constants';

@Component({
  selector: 'app-chat-list',
  imports: [ChatListItem, ButtonDirective, RouterLink, RouterLinkActive],
  templateUrl: './chat-list.html',
  styleUrl: './chat-list.scss',
})
export class ChatList implements OnInit {
  private readonly _chatListStore = inject(ChatListStore);
  private readonly _dialogService = inject(DialogService);

  readonly chats = this._chatListStore.chats;
  readonly errorMessage = this._chatListStore.errorMessage;
  readonly isEmpty = this._chatListStore.isEmpty;

  ngOnInit(): void {
    this._chatListStore.loadChats();
  }

  protected retry(): void {
    this._chatListStore.loadChats();
  }

  protected createChat(): void {
    // Кит создает содержимое от корневого инжектора и стора страницы не видит:
    // форма в диалоге создает чат через Стор страницы, поэтому он едет в data.
    this._dialogService.open(CreateChatModalContent, {
      ...DIALOG_DEFAULTS,
      header: 'New chat',
      data: { chatListStore: this._chatListStore } satisfies CreateChatDialogData,
    });
  }
}

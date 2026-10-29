import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { ChatListItem } from '../../ui/chat-list-item/chat-list-item';
import { CreateChatModalContent } from '../create-chat-modal-content/create-chat-modal-content';

import { ChatListStore } from '@domains/chats/data/chat-list-store';
import { Button } from '@shared/ui/button/button';
import { ModalService } from '@shared/ui/modal/modal-service';

@Component({
  selector: 'app-chat-list',
  imports: [ChatListItem, Button, RouterLink, RouterLinkActive],
  templateUrl: './chat-list.html',
  styleUrl: './chat-list.scss',
})
export class ChatList implements OnInit {
  private readonly _chatListStore = inject(ChatListStore);
  private readonly _modalService = inject(ModalService);

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
    this._modalService.open(CreateChatModalContent, { title: 'New chat' });
  }
}

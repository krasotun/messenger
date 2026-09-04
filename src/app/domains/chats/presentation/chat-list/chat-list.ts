import { Component, inject, OnInit } from '@angular/core';

import { ChatListService } from '../../application/chat-list/chat-list.service';
import { ChatListItem } from '../chat-list-item/chat-list-item';
import { CreateChatModalContent } from '../create-chat-modal-content/create-chat-modal-content';

import { Button } from '@shared/ui/button/button';
import { ModalService } from '@shared/ui/modal/modal-service';

@Component({
  selector: 'app-chat-list',
  imports: [ChatListItem, Button],
  templateUrl: './chat-list.html',
  styleUrl: './chat-list.scss',
})
export class ChatList implements OnInit {
  private readonly _chatListService = inject(ChatListService);
  private readonly _modalService = inject(ModalService);

  readonly chats = this._chatListService.chats;
  readonly errorMessage = this._chatListService.errorMessage;
  readonly isEmpty = this._chatListService.isEmpty;

  ngOnInit(): void {
    this._chatListService.loadChats();
  }

  protected retry(): void {
    this._chatListService.loadChats();
  }

  protected createChat(): void {
    this._modalService.open(CreateChatModalContent, { title: 'New chat' });
  }
}

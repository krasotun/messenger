import { Component, inject, OnInit } from '@angular/core';

import { ChatListService } from '../../application/chat-list/chat-list.service';
import { ChatListItem } from '../chat-list-item/chat-list-item';

import { Button } from '@shared/ui/button/button';

@Component({
  selector: 'app-chat-list',
  imports: [ChatListItem, Button],
  templateUrl: './chat-list.html',
  styleUrl: './chat-list.scss',
})
export class ChatList implements OnInit {
  private readonly _chatListService = inject(ChatListService);

  readonly chats = this._chatListService.chats;
  readonly errorMessage = this._chatListService.errorMessage;
  readonly isEmpty = this._chatListService.isEmpty;

  ngOnInit(): void {
    this._chatListService.loadChats();
  }

  protected retry(): void {
    this._chatListService.loadChats();
  }
}

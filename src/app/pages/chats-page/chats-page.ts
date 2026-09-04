import { Component } from '@angular/core';

import { ChatList } from '@domains/chats';

@Component({
  selector: 'app-chats-page',
  imports: [ChatList],
  templateUrl: './chats-page.html',
  styleUrl: './chats-page.scss',
})
export class ChatsPage {}

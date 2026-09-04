import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ChatList } from '@domains/chats';

@Component({
  selector: 'app-chats-page',
  imports: [ChatList, RouterOutlet],
  templateUrl: './chats-page.html',
  styleUrl: './chats-page.scss',
})
export class ChatsPage {}

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ChatList, provideChatListStore } from '@domains/chats';

@Component({
  selector: 'app-chats-page',
  imports: [ChatList, RouterOutlet],
  templateUrl: './chats-page.html',
  styleUrl: './chats-page.scss',
  // Стор живет со страницей: ушли с нее - состояние чатов уничтожено.
  providers: [provideChatListStore()],
})
export class ChatsPage {}

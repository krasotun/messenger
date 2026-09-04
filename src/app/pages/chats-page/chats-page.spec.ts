import { TestBed } from '@angular/core/testing';
import { provideRouter, Routes, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { ChatsPage } from './chats-page';

const chatMock = {
  id: 1,
  title: 'Analytics Q3',
  avatar: null,
  unreadCount: 0,
  lastMessage: null,
};

describe('chats routing', () => {
  let routes: Routes;
  let chatListServiceMock: {
    chats: () => unknown[];
    errorMessage: () => string | null;
    isEmpty: () => boolean;
    loadChats: () => void;
  };
  let chatUsersServiceMock: {
    chatUsers: () => unknown[];
    errorMessage: () => string | null;
    loadChatUsers: (chatId: number) => void;
  };

  beforeEach(async () => {
    // Роут-конфигурация чатов недоступна для статического импорта из
    // `src/app/pages` (граница ESLint), поэтому берется динамически, как это
    // уже делает production-код в `app.routes.ts`.
    const { ChatListService } =
      await import('@domains/chats/application/chat-list/chat-list.service');
    const { ChatUsersService } =
      await import('@domains/chats/application/chat-users/chat-users.service');
    const { SelectedChatHeader } =
      await import('@domains/chats/presentation/selected-chat-header/selected-chat-header');

    routes = [
      {
        path: '',
        component: ChatsPage,
        children: [{ path: ':chatId', component: SelectedChatHeader }],
      },
    ];

    let usersErrorMessage: string | null = null;

    chatListServiceMock = {
      chats: () => [chatMock],
      errorMessage: () => null,
      isEmpty: () => false,
      loadChats: vi.fn(),
    };

    chatUsersServiceMock = {
      chatUsers: () => [],
      errorMessage: () => usersErrorMessage,
      loadChatUsers: (chatId: number) => {
        usersErrorMessage = chatId === chatMock.id ? null : 'Not found chat';
      },
    };

    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        {
          provide: ChatListService,
          useValue: chatListServiceMock,
        },
        {
          provide: ChatUsersService,
          useValue: chatUsersServiceMock,
        },
      ],
    });
  });

  describe('when no chat is selected', () => {
    it('should explain that no chat is selected', async () => {
      const harness = await RouterTestingHarness.create('/');
      harness.detectChanges();

      expect(harness.routeNativeElement?.textContent).toContain('Select a chat to see it here');
    });
  });

  describe('when a chat is selected', () => {
    it('should show the selected chat header', async () => {
      const harness = await RouterTestingHarness.create('/1');
      harness.detectChanges();

      expect(harness.routeNativeElement?.textContent).toContain('Analytics Q3');
    });
  });

  describe('when returning to the address of a selected chat', () => {
    it('should select the same chat again', async () => {
      const harness = await RouterTestingHarness.create('/1');
      harness.detectChanges();

      await harness.navigateByUrl('/');
      harness.detectChanges();

      await harness.navigateByUrl('/1');
      harness.detectChanges();

      expect(harness.routeNativeElement?.textContent).toContain('Analytics Q3');
    });
  });

  describe('when the selected chat does not exist', () => {
    it('should show an application error and keep the chat list available', async () => {
      const harness = await RouterTestingHarness.create('/999');
      harness.detectChanges();

      expect(harness.routeNativeElement?.textContent).toContain('Not found chat');
      expect(harness.fixture.nativeElement.querySelector('app-chat-list')).not.toBeNull();
    });
  });
});

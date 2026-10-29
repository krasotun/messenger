import { TestBed } from '@angular/core/testing';
import { provideRouter, Routes, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { screen, within } from '@testing-library/angular/zoneless';
import { of, throwError } from 'rxjs';

import { ChatsPage } from './chats-page';

import { ChatMocks } from '@domains/chats/testing';
import { CurrentSessionService } from '@domains/identity-access';
import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
import { NotificationMocks } from '@shared/notifications/testing';
import { ConfirmationService } from '@shared/ui/confirmation';

const chatMock = ChatMocks.chat({ title: 'Analytics Q3' });

describe('chats routing', () => {
  let routes: Routes;

  beforeEach(async () => {
    // Роут-конфигурация чатов недоступна для статического импорта из
    // `src/app/pages` (граница ESLint), поэтому берется динамически, как это
    // уже делает production-код в `app.routes.ts`.
    const { CHAT_GATEWAY } = await import('@domains/chats/data/chat-gateway');
    const { SelectedChat } =
      await import('@domains/chats/feature-selected-chat/selected-chat/selected-chat');

    routes = [
      {
        path: '',
        component: ChatsPage,
        children: [{ path: ':chatId', component: SelectedChat }],
      },
    ];

    const chatGatewayMock = ChatMocks.chatGateway();
    chatGatewayMock.chats.mockReturnValue(of([chatMock]));
    chatGatewayMock.chatUsers.mockImplementation((chatId) =>
      chatId === chatMock.id ? of([]) : throwError(() => new ApplicationError('Not found chat')),
    );

    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        {
          provide: CHAT_GATEWAY,
          useValue: chatGatewayMock,
        },
        {
          provide: NOTIFIER,
          useValue: NotificationMocks.notifier(),
        },
        {
          provide: CurrentSessionService,
          useValue: { currentUser: () => ({ id: chatMock.createdBy }) },
        },
        {
          provide: ConfirmationService,
          useValue: { confirm: () => of(false) },
        },
      ],
    });
  });

  describe('when no chat is selected', () => {
    it('should explain that no chat is selected', async () => {
      const harness = await RouterTestingHarness.create('/');
      harness.detectChanges();

      expect(
        within(harness.routeNativeElement as HTMLElement).getByText('Select a chat to see it here'),
      ).toBeInTheDocument();
    });
  });

  describe('when a chat is selected', () => {
    it('should show the selected chat header', async () => {
      const harness = await RouterTestingHarness.create('/1');
      harness.detectChanges();

      // Название чата есть и в списке слева: шапку выбранного чата выдает ее кнопка.
      expect(screen.getByRole('button', { name: 'Members' })).toBeInTheDocument();
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

      // Название чата есть и в списке слева: шапку выбранного чата выдает ее кнопка.
      expect(screen.getByRole('button', { name: 'Members' })).toBeInTheDocument();
    });
  });

  describe('when the selected chat does not exist', () => {
    it('should show an application error and keep the chat list available', async () => {
      const harness = await RouterTestingHarness.create('/999');
      harness.detectChanges();

      expect(
        within(harness.routeNativeElement as HTMLElement).getByText('Not found chat'),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
    });
  });
});

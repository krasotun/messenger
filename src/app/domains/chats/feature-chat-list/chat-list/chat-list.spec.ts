import { provideRouter } from '@angular/router';
import { render, screen, waitFor, within } from '@testing-library/angular/zoneless';
import { userEvent } from '@testing-library/user-event';
import { DialogService } from 'primeng/dynamicdialog';
import { of, Subject, throwError } from 'rxjs';

import { Chat } from '../../data/chat';
import { CHAT_GATEWAY } from '../../data/chat-gateway';
import { ChatListStore } from '../../data/chat-list-store';

import { ChatList } from './chat-list';

import { ChatMocks } from '@domains/chats/testing';
import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
import { NotificationMocks } from '@shared/notifications/testing';

const chatMock = ChatMocks.chat();

describe('ChatList', () => {
  let chatGatewayMock: ReturnType<typeof ChatMocks.chatGateway>;

  const renderList = () =>
    render(ChatList, {
      providers: [
        provideRouter([]),
        ChatListStore,
        { provide: CHAT_GATEWAY, useValue: chatGatewayMock },
        { provide: NOTIFIER, useValue: NotificationMocks.notifier() },
        DialogService,
      ],
      waitForStableOnRender: true,
    });

  beforeEach(() => {
    chatGatewayMock = ChatMocks.chatGateway();
    chatGatewayMock.chats.mockReturnValue(of([chatMock]));
  });

  it('should create', async () => {
    const { fixture } = await renderList();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should load chats when the screen opens', async () => {
    await renderList();

    expect(chatGatewayMock.chats).toHaveBeenCalledOnce();
  });

  describe('when the current user has chats', () => {
    it('should render a row per chat', async () => {
      chatGatewayMock.chats.mockReturnValue(of([chatMock, { ...chatMock, id: 2 }]));

      await renderList();

      expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });
  });

  describe('when there are no chats yet', () => {
    beforeEach(async () => {
      chatGatewayMock.chats.mockReturnValue(of([]));

      await renderList();
    });

    it('should explain that there are no chats yet', () => {
      expect(screen.getByText('No chats yet')).toBeInTheDocument();
    });

    it('should keep chat creation available', () => {
      expect(screen.getByRole('button', { name: 'Create' })).toBeEnabled();
    });
  });

  describe('when the list fails to load', () => {
    beforeEach(async () => {
      chatGatewayMock.chats.mockReturnValue(throwError(() => new ApplicationError('mockReason')));

      await renderList();
    });

    it('should show the error message', () => {
      expect(screen.getByText('mockReason')).toBeInTheDocument();
    });

    it('should not show the empty state instead of the error', () => {
      expect(screen.queryByText('No chats yet')).not.toBeInTheDocument();
    });

    it('should load the list again on retry', async () => {
      const user = userEvent.setup();
      chatGatewayMock.chats.mockReturnValue(of([chatMock]));

      await user.click(screen.getByRole('button', { name: 'Retry' }));

      expect(chatGatewayMock.chats).toHaveBeenCalledTimes(2);
      expect(screen.getAllByRole('listitem')).toHaveLength(1);
      expect(screen.queryByText('mockReason')).not.toBeInTheDocument();
    });
  });

  describe('create chat', () => {
    const openCreateChatDialog = async (): Promise<HTMLElement> => {
      const user = userEvent.setup();
      await renderList();

      await user.click(screen.getByRole('button', { name: 'Create' }));

      return screen.findByRole('dialog', { name: 'New chat' });
    };

    it('should open a window with the create chat form', async () => {
      const dialog = await openCreateChatDialog();

      expect(within(dialog).getByLabelText('Title')).toBeInTheDocument();
    });

    it('should close the window after the chat is created', async () => {
      const user = userEvent.setup();
      chatGatewayMock.createChat.mockReturnValue(of({ id: 2 }));
      const dialog = await openCreateChatDialog();

      await user.type(within(dialog).getByLabelText('Title'), 'New title');
      await user.click(within(dialog).getByRole('button', { name: 'Create' }));

      await waitFor(() => expect(screen.queryByLabelText('Title')).not.toBeInTheDocument());
      expect(chatGatewayMock.createChat).toHaveBeenCalledWith({ title: 'New title' });
    });

    it('should keep the window open with the typed title when the gateway refuses', async () => {
      const user = userEvent.setup();
      chatGatewayMock.createChat.mockReturnValue(throwError(() => new ApplicationError('Refused')));
      const dialog = await openCreateChatDialog();

      await user.type(within(dialog).getByLabelText('Title'), 'New title');
      await user.click(within(dialog).getByRole('button', { name: 'Create' }));

      expect(within(dialog).getByLabelText('Title')).toHaveValue('New title');
    });
  });

  describe('while the list is loading', () => {
    it('should show neither the empty state nor an error', async () => {
      chatGatewayMock.chats.mockReturnValue(new Subject<Chat[]>());

      await renderList();

      expect(screen.queryByText('No chats yet')).not.toBeInTheDocument();
      expect(screen.queryByText('Failed to load chats')).not.toBeInTheDocument();
    });
  });
});

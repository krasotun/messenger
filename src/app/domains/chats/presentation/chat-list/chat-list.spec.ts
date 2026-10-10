import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular/zoneless';
import { userEvent } from '@testing-library/user-event';
import { of, Subject, throwError } from 'rxjs';

import { CHAT_GATEWAY } from '../../application/chat.gateway';
import { Chat } from '../../application/chat.type';
import { CreateChatModalContent } from '../create-chat-modal-content/create-chat-modal-content';

import { ChatList } from './chat-list';

import { ChatMocks } from '@domains/chats/testing';
import { ApplicationError } from '@shared/errors';
import { ModalService } from '@shared/ui/modal/modal-service';
import { ModalMocks } from '@shared/ui/modal/testing';

const chatMock = ChatMocks.chat();

describe('ChatList', () => {
  let chatGatewayMock: ReturnType<typeof ChatMocks.chatGateway>;
  let modalServiceMock: ReturnType<typeof ModalMocks.modalService>;

  const renderList = () =>
    render(ChatList, {
      providers: [
        provideRouter([]),
        { provide: CHAT_GATEWAY, useValue: chatGatewayMock },
        { provide: ModalService, useValue: modalServiceMock },
      ],
      waitForStableOnRender: true,
    });

  beforeEach(() => {
    chatGatewayMock = ChatMocks.chatGateway();
    modalServiceMock = ModalMocks.modalService();
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
    it('should open the create chat modal', async () => {
      const user = userEvent.setup();
      await renderList();

      await user.click(screen.getByRole('button', { name: 'Create' }));

      expect(modalServiceMock.open).toHaveBeenCalledOnce();
      expect(modalServiceMock.open).toHaveBeenCalledWith(CreateChatModalContent, {
        title: 'New chat',
      });
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

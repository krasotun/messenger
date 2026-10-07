import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ChatListService } from '../chat-list/chat-list.service';
import { CHAT_GATEWAY } from '../chat.gateway';

import { DeleteChatService } from './delete-chat.service';

import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';

const chatGatewayMock = {
  deleteChat: vi.fn(),
};

const chatListServiceMock = {
  loadChats: vi.fn(),
};

const notifierMock = {
  success: vi.fn(),
  error: vi.fn(),
};

describe('DeleteChatService', () => {
  let service: DeleteChatService;

  beforeEach(() => {
    chatGatewayMock.deleteChat.mockReset();
    chatListServiceMock.loadChats.mockReset();
    notifierMock.success.mockReset();
    notifierMock.error.mockReset();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: CHAT_GATEWAY,
          useValue: chatGatewayMock,
        },
        {
          provide: ChatListService,
          useValue: chatListServiceMock,
        },
        {
          provide: NOTIFIER,
          useValue: notifierMock,
        },
        DeleteChatService,
      ],
    });

    service = TestBed.inject(DeleteChatService);
  });

  describe('deleteChat', () => {
    it('should call the chat gateway with the given chat id', () => {
      chatGatewayMock.deleteChat.mockReturnValue(of(undefined));

      service.deleteChat({ chatId: 1 });

      expect(chatGatewayMock.deleteChat).toHaveBeenCalledOnce();
      expect(chatGatewayMock.deleteChat).toHaveBeenCalledWith({ chatId: 1 });
    });

    describe('when the chat is deleted', () => {
      beforeEach(() => {
        chatGatewayMock.deleteChat.mockReturnValue(of(undefined));
      });

      it('should emit succeeded$ once', () => {
        const succeededSpy = vi.fn();
        service.succeeded$.subscribe(succeededSpy);

        service.deleteChat({ chatId: 1 });

        expect(succeededSpy).toHaveBeenCalledOnce();
      });

      it('should reload the chat list', () => {
        service.deleteChat({ chatId: 1 });

        expect(chatListServiceMock.loadChats).toHaveBeenCalledOnce();
      });

      it('should notify about the success', () => {
        service.deleteChat({ chatId: 1 });

        expect(notifierMock.success).toHaveBeenCalledWith(
          'Delete chat',
          'Chat deleted successfully',
        );
      });
    });

    describe('when deleting is rejected', () => {
      beforeEach(() => {
        chatGatewayMock.deleteChat.mockReturnValue(
          throwError(() => new ApplicationError('mockReason')),
        );
      });

      it('should notify with the reason and not emit succeeded$', () => {
        const succeededSpy = vi.fn();
        service.succeeded$.subscribe(succeededSpy);

        service.deleteChat({ chatId: 1 });

        expect(succeededSpy).not.toHaveBeenCalled();
        expect(notifierMock.error).toHaveBeenCalledWith('Failed to delete chat', 'mockReason');
      });

      it('should not reload the chat list', () => {
        service.deleteChat({ chatId: 1 });

        expect(chatListServiceMock.loadChats).not.toHaveBeenCalled();
      });
    });
  });
});

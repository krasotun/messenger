import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { CHAT_GATEWAY } from './chat-gateway';
import { ChatListStore } from './chat-list-store';
import { DeleteChatService } from './delete-chat-service';

import { ChatMocks } from '@domains/chats/testing';
import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
import { NotificationMocks } from '@shared/notifications/testing';

describe('DeleteChatService', () => {
  let chatGatewayMock: ReturnType<typeof ChatMocks.chatGateway>;
  let notifierMock: ReturnType<typeof NotificationMocks.notifier>;
  let service: DeleteChatService;

  beforeEach(() => {
    chatGatewayMock = ChatMocks.chatGateway();
    notifierMock = NotificationMocks.notifier();
    // Удаление перезагружает список настоящего Стора: без ответа шлюза
    // loadChats упадет на subscribe.
    chatGatewayMock.chats.mockReturnValue(of([]));

    TestBed.configureTestingModule({
      providers: [
        {
          provide: CHAT_GATEWAY,
          useValue: chatGatewayMock,
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

      it('should remove the chat from the list', () => {
        const store = TestBed.inject(ChatListStore);
        chatGatewayMock.chats.mockReturnValueOnce(of([ChatMocks.chat()]));
        chatGatewayMock.chats.mockReturnValueOnce(of([]));
        store.loadChats();

        service.deleteChat({ chatId: 1 });

        expect(store.chats()).toEqual([]);
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

      it('should keep the chat in the list', () => {
        const store = TestBed.inject(ChatListStore);
        const chatMock = ChatMocks.chat();
        chatGatewayMock.chats.mockReturnValueOnce(of([chatMock]));
        chatGatewayMock.chats.mockReturnValueOnce(of([]));
        store.loadChats();

        service.deleteChat({ chatId: 1 });

        expect(store.chats()).toEqual([chatMock]);
      });
    });
  });
});

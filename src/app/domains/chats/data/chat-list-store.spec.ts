import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';

import { ChatListStore } from './chat-list-store';

import { CHAT_GATEWAY } from '@domains/chats/data/chat-gateway';
import { CreateChatResult } from '@domains/chats/data/create-chat-result';
import { ChatMocks } from '@domains/chats/testing';
import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
import { NotificationMocks } from '@shared/notifications/testing';

const createChatResultMock: CreateChatResult = {
  id: 1,
};

describe('ChatListStore', () => {
  let store: ChatListStore;
  let chatGatewayMock: ReturnType<typeof ChatMocks.chatGateway>;
  let notifierMock: ReturnType<typeof NotificationMocks.notifier>;

  beforeEach(() => {
    chatGatewayMock = ChatMocks.chatGateway();
    notifierMock = NotificationMocks.notifier();

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
      ],
    });

    store = TestBed.inject(ChatListStore);
  });

  describe('create chat', () => {
    it('should expose the new chat in the list after it is created', () => {
      const newChat = ChatMocks.chat({ title: 'New chat' });

      chatGatewayMock.chats.mockReturnValueOnce(of([]));
      chatGatewayMock.chats.mockReturnValueOnce(of([newChat]));
      chatGatewayMock.createChat.mockReturnValue(of(createChatResultMock));

      store.loadChats();
      store.createChat({ title: 'New chat' });

      expect(store.chats()).toEqual([newChat]);
    });

    it('should be idle before any chat is created', () => {
      expect(store.chatCreationFlow.isSubmitting()).toBe(false);
    });

    it('should call chat gateway with the given title', () => {
      chatGatewayMock.chats.mockReturnValue(of([]));
      chatGatewayMock.createChat.mockReturnValue(of(createChatResultMock));

      store.createChat({ title: 'Analytics Q3' });

      expect(chatGatewayMock.createChat).toHaveBeenCalledOnce();
      expect(chatGatewayMock.createChat).toHaveBeenCalledWith({ title: 'Analytics Q3' });
    });

    it('should mark submitting while the request is pending', () => {
      chatGatewayMock.createChat.mockReturnValue(new Subject<CreateChatResult>());

      store.createChat({ title: 'Analytics Q3' });

      expect(store.chatCreationFlow.isSubmitting()).toBe(true);
    });

    describe('when the chat is created', () => {
      beforeEach(() => {
        chatGatewayMock.chats.mockReturnValue(of([]));
        chatGatewayMock.createChat.mockReturnValue(of(createChatResultMock));
      });

      it('should emit succeeded$ once', () => {
        const succeededSpy = vi.fn();
        store.chatCreationFlow.succeeded$.subscribe(succeededSpy);

        store.createChat({ title: 'Analytics Q3' });

        expect(succeededSpy).toHaveBeenCalledOnce();
        expect(store.chatCreationFlow.isSubmitting()).toBe(false);
      });

      it('should not notify', () => {
        store.createChat({ title: 'Analytics Q3' });

        expect(notifierMock.success).not.toHaveBeenCalled();
        expect(notifierMock.error).not.toHaveBeenCalled();
      });
    });

    describe('when creation is rejected', () => {
      beforeEach(() => {
        chatGatewayMock.createChat.mockReturnValue(
          throwError(() => new ApplicationError('mockReason')),
        );
      });

      it('should notify with the reason and not emit succeeded$', () => {
        const succeededSpy = vi.fn();
        store.chatCreationFlow.succeeded$.subscribe(succeededSpy);

        store.createChat({ title: 'Analytics Q3' });

        expect(succeededSpy).not.toHaveBeenCalled();
        expect(store.chatCreationFlow.isSubmitting()).toBe(false);
        expect(notifierMock.error).toHaveBeenCalledWith('Failed to create chat', 'mockReason');
      });

      it('should keep the list unchanged', () => {
        const otherChat = ChatMocks.chat({ title: 'Other chat' });

        chatGatewayMock.chats.mockReturnValueOnce(of([]));
        chatGatewayMock.chats.mockReturnValueOnce(of([otherChat]));

        store.loadChats();
        store.createChat({ title: 'Analytics Q3' });

        expect(store.chats()).toEqual([]);
      });
    });
  });
});

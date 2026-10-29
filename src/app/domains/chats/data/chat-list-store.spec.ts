import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';

import { ChatListStore } from './chat-list-store';

import { Chat } from '@domains/chats/data/chat';
import { CHAT_GATEWAY } from '@domains/chats/data/chat-gateway';
import { CreateChatResult } from '@domains/chats/data/create-chat-result';
import { ChatMocks } from '@domains/chats/testing';
import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
import { NotificationMocks } from '@shared/notifications/testing';
import { LoadStatus } from '@shared/types';

const createChatResultMock: CreateChatResult = {
  id: 1,
};

describe('ChatListStore', () => {
  let store: ChatListStore;
  let chatGatewayMock: ReturnType<typeof ChatMocks.chatGateway>;
  let notifierMock: ReturnType<typeof NotificationMocks.notifier>;
  let chatMock: Chat;

  beforeEach(() => {
    chatGatewayMock = ChatMocks.chatGateway();
    notifierMock = NotificationMocks.notifier();
    chatMock = ChatMocks.chat();

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

  describe('initial state', () => {
    it('should be idle with an empty list and no error', () => {
      expect(store.status()).toBe(LoadStatus.Idle);
      expect(store.chats()).toEqual([]);
      expect(store.errorMessage()).toBeNull();
    });
  });

  describe('load chats', () => {
    it('should mark loading while the request is pending', () => {
      chatGatewayMock.chats.mockReturnValue(new Subject<Chat[]>());

      store.loadChats();

      expect(store.status()).toBe(LoadStatus.Loading);
    });

    describe('when the current user has chats', () => {
      beforeEach(() => {
        chatGatewayMock.chats.mockReturnValue(of([chatMock]));
      });

      it('should expose the loaded chats', () => {
        store.loadChats();

        expect(store.status()).toBe(LoadStatus.Loaded);
        expect(store.chats()).toEqual([chatMock]);
      });

      it('should not report the list as empty', () => {
        store.loadChats();

        expect(store.isEmpty()).toBe(false);
      });
    });

    describe('when there are no chats yet', () => {
      beforeEach(() => {
        chatGatewayMock.chats.mockReturnValue(of([]));
      });

      it('should report the loaded list as empty', () => {
        store.loadChats();

        expect(store.status()).toBe(LoadStatus.Loaded);
        expect(store.isEmpty()).toBe(true);
        expect(store.errorMessage()).toBeNull();
      });
    });

    describe('when the list fails to load', () => {
      beforeEach(() => {
        chatGatewayMock.chats.mockReturnValue(throwError(() => new ApplicationError('mockReason')));
      });

      it('should expose the error message', () => {
        store.loadChats();

        expect(store.status()).toBe(LoadStatus.Error);
        expect(store.errorMessage()).toBe('mockReason');
      });

      it('should not report the list as empty', () => {
        store.loadChats();

        expect(store.isEmpty()).toBe(false);
      });
    });

    describe('when loading again after an error', () => {
      it('should replace the error with the loaded chats', () => {
        chatGatewayMock.chats.mockReturnValueOnce(
          throwError(() => new ApplicationError('mockReason')),
        );

        store.loadChats();

        expect(store.status()).toBe(LoadStatus.Error);

        chatGatewayMock.chats.mockReturnValueOnce(of([chatMock]));

        store.loadChats();

        expect(store.status()).toBe(LoadStatus.Loaded);
        expect(store.errorMessage()).toBeNull();
        expect(store.chats()).toEqual([chatMock]);
      });

      it('should clear the error message while the retry is pending', () => {
        chatGatewayMock.chats.mockReturnValueOnce(
          throwError(() => new ApplicationError('mockReason')),
        );

        store.loadChats();

        chatGatewayMock.chats.mockReturnValueOnce(new Subject<Chat[]>());

        store.loadChats();

        expect(store.errorMessage()).toBeNull();
        expect(store.status()).toBe(LoadStatus.Loading);
      });
    });
  });

  describe('delete chat', () => {
    it('should call chat gateway with the given chat id', () => {
      chatGatewayMock.deleteChat.mockReturnValue(of(undefined));
      chatGatewayMock.chats.mockReturnValue(of([]));

      store.deleteChat({ chatId: 1 });

      expect(chatGatewayMock.deleteChat).toHaveBeenCalledOnce();
      expect(chatGatewayMock.deleteChat).toHaveBeenCalledWith({ chatId: 1 });
    });

    describe('when the chat is deleted', () => {
      beforeEach(() => {
        chatGatewayMock.deleteChat.mockReturnValue(of(undefined));
        chatGatewayMock.chats.mockReturnValueOnce(of([chatMock]));
        chatGatewayMock.chats.mockReturnValueOnce(of([]));

        store.loadChats();
      });

      it('should drop the chat from the list', () => {
        store.deleteChat({ chatId: 1 });

        expect(store.chats()).toEqual([]);
      });

      it('should emit succeeded$ once', () => {
        const succeededSpy = vi.fn();
        store.chatDeletionFlow.succeeded$.subscribe(succeededSpy);

        store.deleteChat({ chatId: 1 });

        expect(succeededSpy).toHaveBeenCalledOnce();
      });

      it('should notify about the success', () => {
        store.deleteChat({ chatId: 1 });

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
        chatGatewayMock.chats.mockReturnValueOnce(of([chatMock]));
        chatGatewayMock.chats.mockReturnValueOnce(of([]));

        store.loadChats();
      });

      it('should notify with the reason and not emit succeeded$', () => {
        const succeededSpy = vi.fn();
        store.chatDeletionFlow.succeeded$.subscribe(succeededSpy);

        store.deleteChat({ chatId: 1 });

        expect(succeededSpy).not.toHaveBeenCalled();
        expect(notifierMock.error).toHaveBeenCalledWith('Failed to delete chat', 'mockReason');
      });

      it('should keep the chat in the list', () => {
        store.deleteChat({ chatId: 1 });

        expect(store.chats()).toEqual([chatMock]);
      });
    });
  });
});

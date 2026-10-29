import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';

import { ChatUsersStore } from './chat-users-store';

import { AddChatUserResult, CHAT_GATEWAY } from '@domains/chats/data/chat-gateway';
import { ChatUser } from '@domains/chats/data/chat-user';
import { ChatMocks } from '@domains/chats/testing';
import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
import { NotificationMocks } from '@shared/notifications/testing';
import { LoadStatus } from '@shared/types';

const chatUserMock = ChatMocks.chatUser({ id: 2, name: 'Johnny' });

const addChatUserResultMock: AddChatUserResult = {
  userAdded: true,
};

describe('ChatUsersStore', () => {
  let store: ChatUsersStore;
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

    store = TestBed.inject(ChatUsersStore);
  });

  describe('initial state', () => {
    it('should be idle with an empty list and no error', () => {
      expect(store.status()).toBe(LoadStatus.Idle);
      expect(store.chatUsers()).toEqual([]);
      expect(store.errorMessage()).toBeNull();
    });
  });

  describe('load chat users', () => {
    describe('when the chat has members', () => {
      it('should expose the loaded chat users', () => {
        chatGatewayMock.chatUsers.mockReturnValue(of([chatUserMock]));

        store.loadChatUsers(1);

        expect(store.status()).toBe(LoadStatus.Loaded);
        expect(store.chatUsers()).toEqual([chatUserMock]);
      });
    });

    it('should ask the gateway for the given chat', () => {
      chatGatewayMock.chatUsers.mockReturnValue(of([chatUserMock]));

      store.loadChatUsers(1);

      expect(chatGatewayMock.chatUsers).toHaveBeenCalledWith(1);
    });

    it('should mark loading while the request is pending', () => {
      chatGatewayMock.chatUsers.mockReturnValue(new Subject<ChatUser[]>());

      store.loadChatUsers(1);

      expect(store.status()).toBe(LoadStatus.Loading);
    });

    describe('when the request fails', () => {
      it('should expose the error message', () => {
        chatGatewayMock.chatUsers.mockReturnValue(
          throwError(() => new ApplicationError('mockReason')),
        );

        store.loadChatUsers(1);

        expect(store.status()).toBe(LoadStatus.Error);
        expect(store.errorMessage()).toBe('mockReason');
      });
    });

    describe('when loading again for a different chat', () => {
      it('should replace the previous chat users and clear the error', () => {
        chatGatewayMock.chatUsers.mockReturnValueOnce(
          throwError(() => new ApplicationError('mockReason')),
        );

        store.loadChatUsers(1);

        expect(store.status()).toBe(LoadStatus.Error);

        chatGatewayMock.chatUsers.mockReturnValueOnce(of([chatUserMock]));

        store.loadChatUsers(2);

        expect(store.status()).toBe(LoadStatus.Loaded);
        expect(store.errorMessage()).toBeNull();
        expect(store.chatUsers()).toEqual([chatUserMock]);
      });

      it('should not keep the previous chat users while the next chat is loading', () => {
        chatGatewayMock.chatUsers.mockReturnValueOnce(of([chatUserMock]));

        store.loadChatUsers(1);

        chatGatewayMock.chatUsers.mockReturnValueOnce(new Subject<ChatUser[]>());

        store.loadChatUsers(2);

        expect(store.chatUsers()).toEqual([]);
      });
    });

    describe('when a newer request starts before the previous one responds', () => {
      const previousChatUserMock = ChatMocks.chatUser({ id: 3, name: 'Previous' });

      let previousResponse: Subject<ChatUser[]>;
      let latestResponse: Subject<ChatUser[]>;

      beforeEach(() => {
        previousResponse = new Subject<ChatUser[]>();
        latestResponse = new Subject<ChatUser[]>();

        chatGatewayMock.chatUsers
          .mockReturnValueOnce(previousResponse)
          .mockReturnValueOnce(latestResponse);
      });

      it('should cancel the previous request', () => {
        store.loadChatUsers(1);
        store.loadChatUsers(2);

        expect(previousResponse.observed).toBe(false);
        expect(latestResponse.observed).toBe(true);
      });

      it('should keep loading when the previous chat responds first', () => {
        store.loadChatUsers(1);
        store.loadChatUsers(2);

        previousResponse.next([previousChatUserMock]);

        expect(store.status()).toBe(LoadStatus.Loading);
        expect(store.chatUsers()).toEqual([]);
      });

      it('should not let late previous chat users replace the latest ones', () => {
        store.loadChatUsers(1);
        store.loadChatUsers(2);

        latestResponse.next([chatUserMock]);
        previousResponse.next([previousChatUserMock]);

        expect(store.status()).toBe(LoadStatus.Loaded);
        expect(store.chatUsers()).toEqual([chatUserMock]);
      });

      it('should not expose a late error of the previous chat', () => {
        store.loadChatUsers(1);
        store.loadChatUsers(2);

        latestResponse.next([chatUserMock]);
        previousResponse.error(new ApplicationError('mockReason'));

        expect(store.status()).toBe(LoadStatus.Loaded);
        expect(store.errorMessage()).toBeNull();
        expect(store.chatUsers()).toEqual([chatUserMock]);
      });

      it('should apply the latest response when reloading the same chat', () => {
        store.loadChatUsers(1);
        store.loadChatUsers(1);

        latestResponse.next([chatUserMock]);
        previousResponse.next([previousChatUserMock]);

        expect(chatGatewayMock.chatUsers).toHaveBeenCalledTimes(2);
        expect(store.chatUsers()).toEqual([chatUserMock]);
      });
    });
  });

  describe('add chat user', () => {
    it('should expose the added user among the chat users', () => {
      chatGatewayMock.chatUsers.mockReturnValueOnce(of([]));
      chatGatewayMock.chatUsers.mockReturnValueOnce(of([chatUserMock]));
      chatGatewayMock.addChatUser.mockReturnValue(of(addChatUserResultMock));

      store.loadChatUsers(1);
      store.addChatUser({ chatId: 1, userId: 2 });

      expect(store.chatUsers()).toEqual([chatUserMock]);
    });

    it('should be idle before any user is added', () => {
      expect(store.chatUserAdditionFlow.isSubmitting()).toBe(false);
    });

    it('should call the chat gateway with the given chat and user ids', () => {
      chatGatewayMock.addChatUser.mockReturnValue(of(addChatUserResultMock));
      chatGatewayMock.chatUsers.mockReturnValue(of([]));

      store.addChatUser({ chatId: 1, userId: 2 });

      expect(chatGatewayMock.addChatUser).toHaveBeenCalledOnce();
      expect(chatGatewayMock.addChatUser).toHaveBeenCalledWith({ chatId: 1, userId: 2 });
    });

    it('should mark submitting while the request is pending', () => {
      chatGatewayMock.addChatUser.mockReturnValue(new Subject<AddChatUserResult>());

      store.addChatUser({ chatId: 1, userId: 2 });

      expect(store.chatUserAdditionFlow.isSubmitting()).toBe(true);
    });

    describe('when the user is added', () => {
      beforeEach(() => {
        chatGatewayMock.addChatUser.mockReturnValue(of(addChatUserResultMock));
        chatGatewayMock.chatUsers.mockReturnValue(of([chatUserMock]));
      });

      it('should emit succeeded$ once', () => {
        const succeededSpy = vi.fn();
        store.chatUserAdditionFlow.succeeded$.subscribe(succeededSpy);

        store.addChatUser({ chatId: 1, userId: 2 });

        expect(succeededSpy).toHaveBeenCalledOnce();
        expect(store.chatUserAdditionFlow.isSubmitting()).toBe(false);
      });

      it('should reload the members of the given chat', () => {
        store.addChatUser({ chatId: 1, userId: 2 });

        expect(chatGatewayMock.chatUsers).toHaveBeenCalledOnce();
        expect(chatGatewayMock.chatUsers).toHaveBeenCalledWith(1);
      });

      it('should not notify', () => {
        store.addChatUser({ chatId: 1, userId: 2 });

        expect(notifierMock.success).not.toHaveBeenCalled();
        expect(notifierMock.error).not.toHaveBeenCalled();
      });
    });

    describe('when adding is rejected', () => {
      beforeEach(() => {
        chatGatewayMock.addChatUser.mockReturnValue(
          throwError(() => new ApplicationError('mockReason')),
        );
      });

      it('should notify with the reason and not emit succeeded$', () => {
        const succeededSpy = vi.fn();
        store.chatUserAdditionFlow.succeeded$.subscribe(succeededSpy);

        store.addChatUser({ chatId: 1, userId: 2 });

        expect(succeededSpy).not.toHaveBeenCalled();
        expect(store.chatUserAdditionFlow.isSubmitting()).toBe(false);
        expect(notifierMock.error).toHaveBeenCalledWith('Failed to add chat user', 'mockReason');
      });

      it('should keep the chat users unchanged', () => {
        const otherChatUser = ChatMocks.chatUser({ id: 3, name: 'Other' });

        chatGatewayMock.chatUsers.mockReturnValueOnce(of([]));
        chatGatewayMock.chatUsers.mockReturnValueOnce(of([otherChatUser]));

        store.loadChatUsers(1);
        store.addChatUser({ chatId: 1, userId: 2 });

        expect(store.chatUsers()).toEqual([]);
      });
    });
  });

  describe('remove chat user', () => {
    it('should drop the removed user from the chat users', () => {
      chatGatewayMock.chatUsers.mockReturnValueOnce(of([chatUserMock]));
      chatGatewayMock.chatUsers.mockReturnValueOnce(of([]));
      chatGatewayMock.removeChatUser.mockReturnValue(of(undefined));

      store.loadChatUsers(1);
      store.removeChatUser({ chatId: 1, userId: 2 });

      expect(store.chatUsers()).toEqual([]);
    });

    it('should call the chat gateway with the given chat and user ids', () => {
      chatGatewayMock.removeChatUser.mockReturnValue(of(undefined));
      chatGatewayMock.chatUsers.mockReturnValue(of([]));

      store.removeChatUser({ chatId: 1, userId: 2 });

      expect(chatGatewayMock.removeChatUser).toHaveBeenCalledOnce();
      expect(chatGatewayMock.removeChatUser).toHaveBeenCalledWith({ chatId: 1, userId: 2 });
    });

    describe('when the user is removed', () => {
      beforeEach(() => {
        chatGatewayMock.removeChatUser.mockReturnValue(of(undefined));
        chatGatewayMock.chatUsers.mockReturnValue(of([]));
      });

      it('should emit succeeded$ once', () => {
        const succeededSpy = vi.fn();
        store.chatUserRemovalFlow.succeeded$.subscribe(succeededSpy);

        store.removeChatUser({ chatId: 1, userId: 2 });

        expect(succeededSpy).toHaveBeenCalledOnce();
      });

      it('should reload the chat users of that chat', () => {
        store.removeChatUser({ chatId: 1, userId: 2 });

        expect(chatGatewayMock.chatUsers).toHaveBeenCalledOnce();
        expect(chatGatewayMock.chatUsers).toHaveBeenCalledWith(1);
      });

      it('should notify about the success', () => {
        store.removeChatUser({ chatId: 1, userId: 2 });

        expect(notifierMock.success).toHaveBeenCalledWith('Remove member', 'Member removed');
      });
    });

    describe('when removing is rejected', () => {
      beforeEach(() => {
        chatGatewayMock.removeChatUser.mockReturnValue(
          throwError(() => new ApplicationError('mockReason')),
        );
      });

      it('should notify with the reason and not emit succeeded$', () => {
        const succeededSpy = vi.fn();
        store.chatUserRemovalFlow.succeeded$.subscribe(succeededSpy);

        store.removeChatUser({ chatId: 1, userId: 2 });

        expect(succeededSpy).not.toHaveBeenCalled();
        expect(notifierMock.error).toHaveBeenCalledWith('Failed to remove member', 'mockReason');
      });

      it('should keep the chat users unchanged', () => {
        chatGatewayMock.chatUsers.mockReturnValueOnce(of([chatUserMock]));
        chatGatewayMock.chatUsers.mockReturnValueOnce(of([]));

        store.loadChatUsers(1);
        store.removeChatUser({ chatId: 1, userId: 2 });

        expect(store.chatUsers()).toEqual([chatUserMock]);
      });
    });
  });
});

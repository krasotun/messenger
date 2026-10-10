import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ChatUsersService } from '../chat-users/chat-users.service';
import { CHAT_GATEWAY } from '../chat.gateway';

import { RemoveChatUserService } from './remove-chat-user.service';

import { ChatMocks } from '@domains/chats/testing';
import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
import { NotificationMocks } from '@shared/notifications/testing';

describe('RemoveChatUserService', () => {
  let chatGatewayMock: ReturnType<typeof ChatMocks.chatGateway>;
  let chatUsersServiceMock: ReturnType<typeof ChatMocks.chatUsersService>;
  let notifierMock: ReturnType<typeof NotificationMocks.notifier>;
  let service: RemoveChatUserService;

  beforeEach(() => {
    chatGatewayMock = ChatMocks.chatGateway();
    chatUsersServiceMock = ChatMocks.chatUsersService();
    notifierMock = NotificationMocks.notifier();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: CHAT_GATEWAY,
          useValue: chatGatewayMock,
        },
        {
          provide: ChatUsersService,
          useValue: chatUsersServiceMock,
        },
        {
          provide: NOTIFIER,
          useValue: notifierMock,
        },
        RemoveChatUserService,
      ],
    });

    service = TestBed.inject(RemoveChatUserService);
  });

  describe('removeChatUser', () => {
    it('should call the chat gateway with the given chat and user ids', () => {
      chatGatewayMock.removeChatUser.mockReturnValue(of(undefined));

      service.removeChatUser({ chatId: 1, userId: 2 });

      expect(chatGatewayMock.removeChatUser).toHaveBeenCalledOnce();
      expect(chatGatewayMock.removeChatUser).toHaveBeenCalledWith({ chatId: 1, userId: 2 });
    });

    describe('when the user is removed', () => {
      beforeEach(() => {
        chatGatewayMock.removeChatUser.mockReturnValue(of(undefined));
      });

      it('should emit succeeded$ once', () => {
        const succeededSpy = vi.fn();
        service.succeeded$.subscribe(succeededSpy);

        service.removeChatUser({ chatId: 1, userId: 2 });

        expect(succeededSpy).toHaveBeenCalledOnce();
      });

      it('should reload the chat users of that chat', () => {
        service.removeChatUser({ chatId: 1, userId: 2 });

        expect(chatUsersServiceMock.loadChatUsers).toHaveBeenCalledOnce();
        expect(chatUsersServiceMock.loadChatUsers).toHaveBeenCalledWith(1);
      });

      it('should notify about the success', () => {
        service.removeChatUser({ chatId: 1, userId: 2 });

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
        service.succeeded$.subscribe(succeededSpy);

        service.removeChatUser({ chatId: 1, userId: 2 });

        expect(succeededSpy).not.toHaveBeenCalled();
        expect(notifierMock.error).toHaveBeenCalledWith('Failed to remove member', 'mockReason');
      });

      it('should not reload the chat users', () => {
        service.removeChatUser({ chatId: 1, userId: 2 });

        expect(chatUsersServiceMock.loadChatUsers).not.toHaveBeenCalled();
      });
    });
  });
});

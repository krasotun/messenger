import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';

import { ChatUsersService } from '../chat-users/chat-users.service';
import { CHAT_GATEWAY } from '../chat.gateway';

import { AddChatUserResult } from './add-chat-user-result.type';
import { AddChatUserStatus } from './add-chat-user-status.type';
import { AddChatUserService } from './add-chat-user.service';

import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';

const chatGatewayMock = {
  addChatUser: vi.fn(),
};

const chatUsersServiceMock = {
  loadChatUsers: vi.fn(),
};

const notifierMock = {
  success: vi.fn(),
  error: vi.fn(),
};

const addChatUserResultMock: AddChatUserResult = {
  userAdded: true,
};

describe('AddChatUserService', () => {
  let service: AddChatUserService;

  beforeEach(() => {
    chatGatewayMock.addChatUser.mockReset();
    chatUsersServiceMock.loadChatUsers.mockReset();
    notifierMock.success.mockReset();
    notifierMock.error.mockReset();

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
        AddChatUserService,
      ],
    });

    service = TestBed.inject(AddChatUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should be idle', () => {
      expect(service.status()).toBe(AddChatUserStatus.Idle);
      expect(service.isSubmitting()).toBe(false);
    });
  });

  describe('addChatUser', () => {
    it('should call the chat gateway with the given chat and user ids', () => {
      chatGatewayMock.addChatUser.mockReturnValue(of(addChatUserResultMock));

      service.addChatUser({ chatId: 1, userId: 2 });

      expect(chatGatewayMock.addChatUser).toHaveBeenCalledOnce();
      expect(chatGatewayMock.addChatUser).toHaveBeenCalledWith({ chatId: 1, userId: 2 });
    });

    it('should mark submitting while the request is pending', () => {
      chatGatewayMock.addChatUser.mockReturnValue(new Subject<AddChatUserResult>());

      service.addChatUser({ chatId: 1, userId: 2 });

      expect(service.status()).toBe(AddChatUserStatus.Submitting);
      expect(service.isSubmitting()).toBe(true);
    });

    describe('when the user is added', () => {
      beforeEach(() => {
        chatGatewayMock.addChatUser.mockReturnValue(of(addChatUserResultMock));
      });

      it('should set success state', () => {
        service.addChatUser({ chatId: 1, userId: 2 });

        expect(service.status()).toBe(AddChatUserStatus.Success);
      });

      it('should reload the members of the given chat', () => {
        service.addChatUser({ chatId: 1, userId: 2 });

        expect(chatUsersServiceMock.loadChatUsers).toHaveBeenCalledOnce();
        expect(chatUsersServiceMock.loadChatUsers).toHaveBeenCalledWith(1);
      });

      it('should not notify', () => {
        service.addChatUser({ chatId: 1, userId: 2 });

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

      it('should set error state and notify with the reason', () => {
        service.addChatUser({ chatId: 1, userId: 2 });

        expect(service.status()).toBe(AddChatUserStatus.Error);
        expect(notifierMock.error).toHaveBeenCalledWith('Failed to add chat user', 'mockReason');
      });

      it('should not reload chat members', () => {
        service.addChatUser({ chatId: 1, userId: 2 });

        expect(chatUsersServiceMock.loadChatUsers).not.toHaveBeenCalled();
      });
    });
  });

  describe('reset', () => {
    it('should reset status', () => {
      chatGatewayMock.addChatUser.mockReturnValue(
        throwError(() => new ApplicationError('mockReason')),
      );

      service.addChatUser({ chatId: 1, userId: 2 });

      expect(service.status()).toBe(AddChatUserStatus.Error);

      service.reset();

      expect(service.status()).toBe(AddChatUserStatus.Idle);
    });
  });
});

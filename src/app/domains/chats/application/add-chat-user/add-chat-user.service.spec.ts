import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';

import { ChatUsersService } from '../chat-users/chat-users.service';
import { CHAT_GATEWAY } from '../chat.gateway';

import { AddChatUserResult } from './add-chat-user-result.type';
import { AddChatUserStatus } from './add-chat-user-status.type';
import { AddChatUserService } from './add-chat-user.service';

import { ApplicationError } from '@shared/errors';

const chatGatewayMock = {
  addChatUser: vi.fn(),
};

const chatUsersServiceMock = {
  loadChatUsers: vi.fn(),
};

const addChatUserResultMock: AddChatUserResult = {
  userAdded: true,
};

describe('AddChatUserService', () => {
  let service: AddChatUserService;

  beforeEach(() => {
    chatGatewayMock.addChatUser.mockReset();
    chatUsersServiceMock.loadChatUsers.mockReset();

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
        AddChatUserService,
      ],
    });

    service = TestBed.inject(AddChatUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should be idle with no error', () => {
      expect(service.status()).toBe(AddChatUserStatus.Idle);
      expect(service.errorMessage()).toBeNull();
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
        expect(service.errorMessage()).toBeNull();
      });

      it('should reload the members of the given chat', () => {
        service.addChatUser({ chatId: 1, userId: 2 });

        expect(chatUsersServiceMock.loadChatUsers).toHaveBeenCalledOnce();
        expect(chatUsersServiceMock.loadChatUsers).toHaveBeenCalledWith(1);
      });
    });

    describe('when adding is rejected', () => {
      beforeEach(() => {
        chatGatewayMock.addChatUser.mockReturnValue(
          throwError(() => new ApplicationError('mockReason')),
        );
      });

      it('should expose the error message', () => {
        service.addChatUser({ chatId: 1, userId: 2 });

        expect(service.status()).toBe(AddChatUserStatus.Error);
        expect(service.errorMessage()).toBe('mockReason');
      });

      it('should not reload chat members', () => {
        service.addChatUser({ chatId: 1, userId: 2 });

        expect(chatUsersServiceMock.loadChatUsers).not.toHaveBeenCalled();
      });
    });
  });

  describe('reset', () => {
    it('should reset status and error message', () => {
      chatGatewayMock.addChatUser.mockReturnValue(
        throwError(() => new ApplicationError('mockReason')),
      );

      service.addChatUser({ chatId: 1, userId: 2 });

      expect(service.status()).toBe(AddChatUserStatus.Error);

      service.reset();

      expect(service.status()).toBe(AddChatUserStatus.Idle);
      expect(service.errorMessage()).toBeNull();
    });
  });
});

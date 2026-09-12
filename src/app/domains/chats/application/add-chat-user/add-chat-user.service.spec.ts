import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';

import { ChatUsersService } from '../chat-users/chat-users.service';
import { CHAT_GATEWAY } from '../chat.gateway';

import { AddChatUserResult } from './add-chat-user-result.type';
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

      expect(service.isSubmitting()).toBe(true);
    });

    describe('when the user is added', () => {
      beforeEach(() => {
        chatGatewayMock.addChatUser.mockReturnValue(of(addChatUserResultMock));
      });

      it('should emit succeeded$ once', () => {
        const succeededSpy = vi.fn();
        service.succeeded$.subscribe(succeededSpy);

        service.addChatUser({ chatId: 1, userId: 2 });

        expect(succeededSpy).toHaveBeenCalledOnce();
        expect(service.isSubmitting()).toBe(false);
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

      it('should notify with the reason and not emit succeeded$', () => {
        const succeededSpy = vi.fn();
        service.succeeded$.subscribe(succeededSpy);

        service.addChatUser({ chatId: 1, userId: 2 });

        expect(succeededSpy).not.toHaveBeenCalled();
        expect(service.isSubmitting()).toBe(false);
        expect(notifierMock.error).toHaveBeenCalledWith('Failed to add chat user', 'mockReason');
      });

      it('should not reload chat members', () => {
        service.addChatUser({ chatId: 1, userId: 2 });

        expect(chatUsersServiceMock.loadChatUsers).not.toHaveBeenCalled();
      });
    });
  });
});

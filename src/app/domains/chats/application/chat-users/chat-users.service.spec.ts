import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';

import { ChatUser } from '../chat-user';
import { CHAT_GATEWAY } from '../chat.gateway';

import { ChatUsersStatus } from './chat-users-status';
import { ChatUsersService } from './chat-users.service';

import { ApplicationError } from '@shared/errors';

const chatGatewayMock = {
  chatUsers: vi.fn(),
};

const chatUserMock: ChatUser = {
  id: 2,
  name: 'Johnny',
  avatar: null,
};

describe('ChatUsersService', () => {
  let service: ChatUsersService;

  beforeEach(() => {
    chatGatewayMock.chatUsers.mockReset();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: CHAT_GATEWAY,
          useValue: chatGatewayMock,
        },
      ],
    });

    service = TestBed.inject(ChatUsersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should be idle with an empty list and no error', () => {
      expect(service.status()).toBe(ChatUsersStatus.Idle);
      expect(service.chatUsers()).toEqual([]);
      expect(service.errorMessage()).toBeNull();
    });
  });

  describe('loadChatUsers', () => {
    it('should ask the gateway for the given chat', () => {
      chatGatewayMock.chatUsers.mockReturnValue(of([chatUserMock]));

      service.loadChatUsers(1);

      expect(chatGatewayMock.chatUsers).toHaveBeenCalledWith(1);
    });

    it('should mark loading while the request is pending', () => {
      chatGatewayMock.chatUsers.mockReturnValue(new Subject<ChatUser[]>());

      service.loadChatUsers(1);

      expect(service.status()).toBe(ChatUsersStatus.Loading);
      expect(service.isLoading()).toBe(true);
    });

    describe('when the chat has members', () => {
      it('should expose the loaded chat users', () => {
        chatGatewayMock.chatUsers.mockReturnValue(of([chatUserMock]));

        service.loadChatUsers(1);

        expect(service.status()).toBe(ChatUsersStatus.Loaded);
        expect(service.chatUsers()).toEqual([chatUserMock]);
      });
    });

    describe('when the request fails', () => {
      it('should expose the error message', () => {
        chatGatewayMock.chatUsers.mockReturnValue(
          throwError(() => new ApplicationError('mockReason')),
        );

        service.loadChatUsers(1);

        expect(service.status()).toBe(ChatUsersStatus.Error);
        expect(service.errorMessage()).toBe('mockReason');
      });
    });

    describe('when loading again for a different chat', () => {
      it('should replace the previous chat users and clear the error', () => {
        chatGatewayMock.chatUsers.mockReturnValueOnce(
          throwError(() => new ApplicationError('mockReason')),
        );

        service.loadChatUsers(1);

        expect(service.status()).toBe(ChatUsersStatus.Error);

        chatGatewayMock.chatUsers.mockReturnValueOnce(of([chatUserMock]));

        service.loadChatUsers(2);

        expect(service.status()).toBe(ChatUsersStatus.Loaded);
        expect(service.errorMessage()).toBeNull();
        expect(service.chatUsers()).toEqual([chatUserMock]);
      });
    });
  });
});

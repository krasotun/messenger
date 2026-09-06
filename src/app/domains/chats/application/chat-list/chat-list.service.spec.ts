import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';

import { CHAT_GATEWAY } from '../chat.gateway';
import { Chat } from '../chat.type';

import { ChatListStatus } from './chat-list-status.type';
import { ChatListService } from './chat-list.service';

import { ApplicationError } from '@shared/errors';

const chatGatewayMock = {
  chats: vi.fn(),
};

const chatMock: Chat = {
  id: 1,
  title: 'Analytics Q3',
  avatar: null,
  unreadCount: 3,
  lastMessage: {
    authorName: 'John',
    content: 'the report is ready',
  },
};

describe('ChatListService', () => {
  let service: ChatListService;

  beforeEach(() => {
    chatGatewayMock.chats.mockReset();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: CHAT_GATEWAY,
          useValue: chatGatewayMock,
        },
      ],
    });

    service = TestBed.inject(ChatListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should be idle with an empty list and no error', () => {
      expect(service.status()).toBe(ChatListStatus.Idle);
      expect(service.chats()).toEqual([]);
      expect(service.errorMessage()).toBeNull();
    });
  });

  describe('loadChats', () => {
    it('should mark loading while the request is pending', () => {
      chatGatewayMock.chats.mockReturnValue(new Subject<Chat[]>());

      service.loadChats();

      expect(service.status()).toBe(ChatListStatus.Loading);
      expect(service.isLoading()).toBe(true);
    });

    describe('when the current user has chats', () => {
      beforeEach(() => {
        chatGatewayMock.chats.mockReturnValue(of([chatMock]));
      });

      it('should expose the loaded chats', () => {
        service.loadChats();

        expect(service.status()).toBe(ChatListStatus.Loaded);
        expect(service.chats()).toEqual([chatMock]);
      });

      it('should not report the list as empty', () => {
        service.loadChats();

        expect(service.isEmpty()).toBe(false);
      });
    });

    describe('when there are no chats yet', () => {
      beforeEach(() => {
        chatGatewayMock.chats.mockReturnValue(of([]));
      });

      it('should report the loaded list as empty', () => {
        service.loadChats();

        expect(service.status()).toBe(ChatListStatus.Loaded);
        expect(service.isEmpty()).toBe(true);
        expect(service.errorMessage()).toBeNull();
      });
    });

    describe('when the list fails to load', () => {
      beforeEach(() => {
        chatGatewayMock.chats.mockReturnValue(throwError(() => new ApplicationError('mockReason')));
      });

      it('should expose the error message', () => {
        service.loadChats();

        expect(service.status()).toBe(ChatListStatus.Error);
        expect(service.errorMessage()).toBe('mockReason');
      });

      it('should not report the list as empty', () => {
        service.loadChats();

        expect(service.isEmpty()).toBe(false);
      });
    });

    describe('when loading again after an error', () => {
      it('should replace the error with the loaded chats', () => {
        chatGatewayMock.chats.mockReturnValueOnce(
          throwError(() => new ApplicationError('mockReason')),
        );

        service.loadChats();

        expect(service.status()).toBe(ChatListStatus.Error);

        chatGatewayMock.chats.mockReturnValueOnce(of([chatMock]));

        service.loadChats();

        expect(service.status()).toBe(ChatListStatus.Loaded);
        expect(service.errorMessage()).toBeNull();
        expect(service.chats()).toEqual([chatMock]);
      });

      it('should clear the error message while the retry is pending', () => {
        chatGatewayMock.chats.mockReturnValueOnce(
          throwError(() => new ApplicationError('mockReason')),
        );

        service.loadChats();

        chatGatewayMock.chats.mockReturnValueOnce(new Subject<Chat[]>());

        service.loadChats();

        expect(service.errorMessage()).toBeNull();
        expect(service.status()).toBe(ChatListStatus.Loading);
      });
    });
  });
});

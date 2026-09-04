import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';

import { ChatListService } from '../chat-list/chat-list.service';
import { CHAT_GATEWAY } from '../chat.gateway';

import { CreateChatStatus } from './create-chat-status';
import { CreateChatResult } from './create-chat.result';
import { CreateChatService } from './create-chat.service';

import { ApplicationError } from '@shared/errors';

const chatGatewayMock = {
  chats: vi.fn(),
  createChat: vi.fn(),
};

const chatListServiceMock = {
  loadChats: vi.fn(),
};

const createChatResultMock: CreateChatResult = {
  id: 1,
};

describe('CreateChatService', () => {
  let service: CreateChatService;

  beforeEach(() => {
    chatGatewayMock.chats.mockReset();
    chatGatewayMock.createChat.mockReset();
    chatListServiceMock.loadChats.mockReset();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: CHAT_GATEWAY,
          useValue: chatGatewayMock,
        },
        {
          provide: ChatListService,
          useValue: chatListServiceMock,
        },
        CreateChatService,
      ],
    });

    service = TestBed.inject(CreateChatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should be idle with no error', () => {
      expect(service.status()).toBe(CreateChatStatus.Idle);
      expect(service.errorMessage()).toBeNull();
      expect(service.isSubmitting()).toBe(false);
    });
  });

  describe('createChat', () => {
    it('should call chat gateway with the given title', () => {
      chatGatewayMock.createChat.mockReturnValue(of(createChatResultMock));

      service.createChat({ title: 'Analytics Q3' });

      expect(chatGatewayMock.createChat).toHaveBeenCalledOnce();
      expect(chatGatewayMock.createChat).toHaveBeenCalledWith({ title: 'Analytics Q3' });
    });

    it('should mark submitting while the request is pending', () => {
      chatGatewayMock.createChat.mockReturnValue(new Subject<CreateChatResult>());

      service.createChat({ title: 'Analytics Q3' });

      expect(service.status()).toBe(CreateChatStatus.Submitting);
      expect(service.isSubmitting()).toBe(true);
    });

    describe('when the chat is created', () => {
      beforeEach(() => {
        chatGatewayMock.createChat.mockReturnValue(of(createChatResultMock));
      });

      it('should set success state', () => {
        service.createChat({ title: 'Analytics Q3' });

        expect(service.status()).toBe(CreateChatStatus.Success);
        expect(service.errorMessage()).toBeNull();
      });

      it('should reload the chat list', () => {
        service.createChat({ title: 'Analytics Q3' });

        expect(chatListServiceMock.loadChats).toHaveBeenCalledOnce();
      });
    });

    describe('when creation is rejected', () => {
      beforeEach(() => {
        chatGatewayMock.createChat.mockReturnValue(
          throwError(() => new ApplicationError('mockReason')),
        );
      });

      it('should expose the error message', () => {
        service.createChat({ title: 'Analytics Q3' });

        expect(service.status()).toBe(CreateChatStatus.Error);
        expect(service.errorMessage()).toBe('mockReason');
      });

      it('should not reload the chat list', () => {
        service.createChat({ title: 'Analytics Q3' });

        expect(chatListServiceMock.loadChats).not.toHaveBeenCalled();
      });
    });
  });

  describe('reset', () => {
    it('should reset status and error message', () => {
      chatGatewayMock.createChat.mockReturnValue(
        throwError(() => new ApplicationError('mockReason')),
      );

      service.createChat({ title: 'Analytics Q3' });

      expect(service.status()).toBe(CreateChatStatus.Error);

      service.reset();

      expect(service.status()).toBe(CreateChatStatus.Idle);
      expect(service.errorMessage()).toBeNull();
    });
  });
});

import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';

import { ChatListService } from '../chat-list/chat-list.service';
import { CHAT_GATEWAY } from '../chat.gateway';

import { CreateChatResult } from './create-chat-result.type';
import { CreateChatService } from './create-chat.service';

import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';

const chatGatewayMock = {
  chats: vi.fn(),
  createChat: vi.fn(),
};

const chatListServiceMock = {
  loadChats: vi.fn(),
};

const notifierMock = {
  success: vi.fn(),
  error: vi.fn(),
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
    notifierMock.success.mockReset();
    notifierMock.error.mockReset();

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
        {
          provide: NOTIFIER,
          useValue: notifierMock,
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
    it('should be idle', () => {
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

      expect(service.isSubmitting()).toBe(true);
    });

    describe('when the chat is created', () => {
      beforeEach(() => {
        chatGatewayMock.createChat.mockReturnValue(of(createChatResultMock));
      });

      it('should emit succeeded$ once', () => {
        const succeededSpy = vi.fn();
        service.succeeded$.subscribe(succeededSpy);

        service.createChat({ title: 'Analytics Q3' });

        expect(succeededSpy).toHaveBeenCalledOnce();
        expect(service.isSubmitting()).toBe(false);
      });

      it('should reload the chat list', () => {
        service.createChat({ title: 'Analytics Q3' });

        expect(chatListServiceMock.loadChats).toHaveBeenCalledOnce();
      });

      it('should not notify', () => {
        service.createChat({ title: 'Analytics Q3' });

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
        service.succeeded$.subscribe(succeededSpy);

        service.createChat({ title: 'Analytics Q3' });

        expect(succeededSpy).not.toHaveBeenCalled();
        expect(service.isSubmitting()).toBe(false);
        expect(notifierMock.error).toHaveBeenCalledWith('Failed to create chat', 'mockReason');
      });

      it('should not reload the chat list', () => {
        service.createChat({ title: 'Analytics Q3' });

        expect(chatListServiceMock.loadChats).not.toHaveBeenCalled();
      });
    });
  });
});

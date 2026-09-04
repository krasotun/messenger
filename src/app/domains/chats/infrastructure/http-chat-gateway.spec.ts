import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { Chat } from '../application/chat';

import { ChatApi } from './chat.api';
import { ChatDto } from './chat.dto';
import { HttpChatGateway } from './http-chat-gateway';

import { RESOURCES_BASE_URL } from '@core/tokens';
import { ApplicationError } from '@shared/errors';

const chatApiMock = {
  chats: vi.fn(),
  createChat: vi.fn(),
};

const resourcesBaseUrlMock = 'https://mock.host/resources';

const chatDtoMock: ChatDto = {
  id: 1,
  title: 'Analytics Q3',
  avatar: '/path/to/chat-avatar.png',
  unread_count: 3,
  last_message: {
    user: {
      first_name: 'John',
      second_name: 'Doe',
      display_name: 'Johnny',
      login: 'john.doe',
      avatar: null,
      email: 'john.doe@example.com',
      phone: '+79990000000',
    },
    time: '2026-09-04T14:22:22.000Z',
    content: 'the report is ready',
  },
};

const chatMock: Chat = {
  id: 1,
  title: 'Analytics Q3',
  avatar: `${resourcesBaseUrlMock}/path/to/chat-avatar.png`,
  unreadCount: 3,
  lastMessage: {
    authorName: 'Johnny',
    content: 'the report is ready',
  },
};

describe('HttpChatGateway', () => {
  let service: HttpChatGateway;

  beforeEach(() => {
    chatApiMock.chats.mockReset();
    chatApiMock.createChat.mockReset();

    TestBed.configureTestingModule({
      providers: [
        HttpChatGateway,
        {
          provide: ChatApi,
          useValue: chatApiMock,
        },
        {
          provide: RESOURCES_BASE_URL,
          useValue: resourcesBaseUrlMock,
        },
      ],
    });

    service = TestBed.inject(HttpChatGateway);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('chats', () => {
    it('should ask api for chats', () => {
      chatApiMock.chats.mockReturnValue(of([chatDtoMock]));

      service.chats().subscribe();

      expect(chatApiMock.chats).toHaveBeenCalledOnce();
    });

    it('should map response to chats with resolved avatar url', () => {
      chatApiMock.chats.mockReturnValue(of([chatDtoMock]));

      const results: unknown[] = [];

      service.chats().subscribe((chats) => {
        results.push(chats);
      });

      expect(results).toEqual([[chatMock]]);
    });

    it('should map chat without avatar to null avatar', () => {
      chatApiMock.chats.mockReturnValue(of([{ ...chatDtoMock, avatar: null }]));

      const results: Chat[][] = [];

      service.chats().subscribe((chats) => {
        results.push(chats);
      });

      expect(results[0][0].avatar).toBeNull();
    });

    it('should map chat without last message to null last message', () => {
      chatApiMock.chats.mockReturnValue(of([{ ...chatDtoMock, last_message: null }]));

      const results: Chat[][] = [];

      service.chats().subscribe((chats) => {
        results.push(chats);
      });

      expect(results[0][0].lastMessage).toBeNull();
    });

    it('should name last message author by first name when display name is missing', () => {
      chatApiMock.chats.mockReturnValue(
        of([
          {
            ...chatDtoMock,
            last_message: {
              ...chatDtoMock.last_message,
              user: { ...chatDtoMock.last_message?.user, display_name: null },
            },
          },
        ]),
      );

      const results: Chat[][] = [];

      service.chats().subscribe((chats) => {
        results.push(chats);
      });

      expect(results[0][0].lastMessage?.authorName).toBe('John');
    });

    it('should map error to ApplicationError with reason from response body', () => {
      const error = new HttpErrorResponse({
        error: { reason: 'mockReason' },
      });

      chatApiMock.chats.mockReturnValue(throwError(() => error));

      const errors: ApplicationError[] = [];

      service.chats().subscribe({
        error: (applicationError: ApplicationError) => {
          errors.push(applicationError);
        },
      });

      expect(errors).toHaveLength(1);
      expect(errors[0]).toBeInstanceOf(ApplicationError);
      expect(errors[0].message).toBe('mockReason');
    });

    it('should map generic error to ApplicationError with fallback message', () => {
      chatApiMock.chats.mockReturnValue(throwError(() => 'mockError'));

      const errors: ApplicationError[] = [];

      service.chats().subscribe({
        error: (applicationError: ApplicationError) => {
          errors.push(applicationError);
        },
      });

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Failed to load chats. Please try again.');
    });
  });

  describe('createChat', () => {
    it('should ask api to create a chat with the given title', () => {
      chatApiMock.createChat.mockReturnValue(of({ id: 1 }));

      service.createChat({ title: 'Analytics Q3' }).subscribe();

      expect(chatApiMock.createChat).toHaveBeenCalledOnce();
      expect(chatApiMock.createChat).toHaveBeenCalledWith({ title: 'Analytics Q3' });
    });

    it('should map response to the created chat id', () => {
      chatApiMock.createChat.mockReturnValue(of({ id: 1 }));

      const results: unknown[] = [];

      service.createChat({ title: 'Analytics Q3' }).subscribe((result) => {
        results.push(result);
      });

      expect(results).toEqual([{ id: 1 }]);
    });

    it('should map error to ApplicationError with reason from response body', () => {
      const error = new HttpErrorResponse({
        error: { reason: 'mockReason' },
      });

      chatApiMock.createChat.mockReturnValue(throwError(() => error));

      const errors: ApplicationError[] = [];

      service.createChat({ title: 'Analytics Q3' }).subscribe({
        error: (applicationError: ApplicationError) => {
          errors.push(applicationError);
        },
      });

      expect(errors).toHaveLength(1);
      expect(errors[0]).toBeInstanceOf(ApplicationError);
      expect(errors[0].message).toBe('mockReason');
    });

    it('should map generic error to ApplicationError with fallback message', () => {
      chatApiMock.createChat.mockReturnValue(throwError(() => 'mockError'));

      const errors: ApplicationError[] = [];

      service.createChat({ title: 'Analytics Q3' }).subscribe({
        error: (applicationError: ApplicationError) => {
          errors.push(applicationError);
        },
      });

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Failed to create chat. Please try again.');
    });
  });
});

import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
  TestRequest,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Chat } from './chat';
import { ChatUser } from './chat-user';
import { HttpChatGateway } from './http-chat-gateway';
import { ChatDto, ChatUserDto } from './internal/chat-dto';
import { CHAT_ERROR_MESSAGES } from './internal/error-messages';

import { RESOURCES_BASE_URL } from '@core/tokens';
import { ApplicationError } from '@shared/errors';

const resourcesBaseUrlMock = 'https://mock.host/resources';

const chatDtoMock: ChatDto = {
  id: 1,
  title: 'Analytics Q3',
  avatar: '/path/to/chat-avatar.png',
  unread_count: 3,
  created_by: 1,
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
  createdBy: 1,
  lastMessage: {
    authorName: 'Johnny',
    content: 'the report is ready',
  },
};

const chatUserDtoMock: ChatUserDto = {
  id: 2,
  first_name: 'John',
  second_name: 'Doe',
  display_name: 'Johnny',
  login: 'john.doe',
  avatar: '/path/to/user-avatar.png',
};

const chatUserMock: ChatUser = {
  id: 2,
  name: 'Johnny',
  avatar: `${resourcesBaseUrlMock}/path/to/user-avatar.png`,
};

// Ответ с причиной - как отказ бэкенда; без причины - как сбой сервера,
// для которого Шлюз подставляет свой текст.
const flushRejection = (request: TestRequest): void => {
  request.flush({ reason: 'mockReason' }, { status: 400, statusText: 'Bad Request' });
};

const flushServerFailure = (request: TestRequest): void => {
  request.flush('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });
};

describe('HttpChatGateway', () => {
  let service: HttpChatGateway;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HttpChatGateway,
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: RESOURCES_BASE_URL,
          useValue: resourcesBaseUrlMock,
        },
      ],
    });

    service = TestBed.inject(HttpChatGateway);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('chats', () => {
    const loadChats = (): { results: Chat[][]; errors: ApplicationError[] } => {
      const results: Chat[][] = [];
      const errors: ApplicationError[] = [];

      service.chats().subscribe({
        next: (chats) => results.push(chats),
        error: (applicationError: ApplicationError) => errors.push(applicationError),
      });

      return { results, errors };
    };

    it('should send GET request to relative url', () => {
      loadChats();

      const request = httpTestingController.expectOne('/chats');

      expect(request.request.method).toBe('GET');

      request.flush([chatDtoMock]);
    });

    it('should map response to chats with resolved avatar url', () => {
      const { results } = loadChats();

      httpTestingController.expectOne('/chats').flush([chatDtoMock]);

      expect(results).toEqual([[chatMock]]);
    });

    it('should map chat without avatar to null avatar', () => {
      const { results } = loadChats();

      httpTestingController.expectOne('/chats').flush([{ ...chatDtoMock, avatar: null }]);

      expect(results[0][0].avatar).toBeNull();
    });

    it('should map chat without last message to null last message', () => {
      const { results } = loadChats();

      httpTestingController.expectOne('/chats').flush([{ ...chatDtoMock, last_message: null }]);

      expect(results[0][0].lastMessage).toBeNull();
    });

    it('should name last message author by first name when display name is missing', () => {
      const { results } = loadChats();

      httpTestingController.expectOne('/chats').flush([
        {
          ...chatDtoMock,
          last_message: {
            ...chatDtoMock.last_message,
            user: { ...chatDtoMock.last_message?.user, display_name: null },
          },
        },
      ]);

      expect(results[0][0].lastMessage?.authorName).toBe('John');
    });

    it('should map error to ApplicationError with reason from response body', () => {
      const { errors } = loadChats();

      flushRejection(httpTestingController.expectOne('/chats'));

      expect(errors).toHaveLength(1);
      expect(errors[0]).toBeInstanceOf(ApplicationError);
      expect(errors[0].message).toBe('mockReason');
    });

    it('should map generic error to ApplicationError with fallback message', () => {
      const { errors } = loadChats();

      flushServerFailure(httpTestingController.expectOne('/chats'));

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe(CHAT_ERROR_MESSAGES.chats);
    });
  });

  describe('createChat', () => {
    const createChat = (): { results: unknown[]; errors: ApplicationError[] } => {
      const results: unknown[] = [];
      const errors: ApplicationError[] = [];

      service.createChat({ title: 'Analytics Q3' }).subscribe({
        next: (result) => results.push(result),
        error: (applicationError: ApplicationError) => errors.push(applicationError),
      });

      return { results, errors };
    };

    it('should send POST request with the title', () => {
      createChat();

      const request = httpTestingController.expectOne('/chats');

      expect(request.request.method).toBe('POST');
      expect(request.request.body).toEqual({ title: 'Analytics Q3' });

      request.flush({ id: 1 });
    });

    it('should map response to the created chat id', () => {
      const { results } = createChat();

      httpTestingController.expectOne('/chats').flush({ id: 1 });

      expect(results).toEqual([{ id: 1 }]);
    });

    it('should map error to ApplicationError with reason from response body', () => {
      const { errors } = createChat();

      flushRejection(httpTestingController.expectOne('/chats'));

      expect(errors).toHaveLength(1);
      expect(errors[0]).toBeInstanceOf(ApplicationError);
      expect(errors[0].message).toBe('mockReason');
    });

    it('should map generic error to ApplicationError with fallback message', () => {
      const { errors } = createChat();

      flushServerFailure(httpTestingController.expectOne('/chats'));

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe(CHAT_ERROR_MESSAGES.createChat);
    });
  });

  describe('chatUsers', () => {
    const loadChatUsers = (): { results: ChatUser[][]; errors: ApplicationError[] } => {
      const results: ChatUser[][] = [];
      const errors: ApplicationError[] = [];

      service.chatUsers(1).subscribe({
        next: (chatUsers) => results.push(chatUsers),
        error: (applicationError: ApplicationError) => errors.push(applicationError),
      });

      return { results, errors };
    };

    it('should send GET request to the chat users url', () => {
      loadChatUsers();

      const request = httpTestingController.expectOne('/chats/1/users');

      expect(request.request.method).toBe('GET');

      request.flush([chatUserDtoMock]);
    });

    it('should map response to chat users with resolved avatar url', () => {
      const { results } = loadChatUsers();

      httpTestingController.expectOne('/chats/1/users').flush([chatUserDtoMock]);

      expect(results).toEqual([[chatUserMock]]);
    });

    it('should name a chat user by first name when display name is missing', () => {
      const { results } = loadChatUsers();

      httpTestingController
        .expectOne('/chats/1/users')
        .flush([{ ...chatUserDtoMock, display_name: null }]);

      expect(results[0][0].name).toBe('John');
    });

    it('should map error to ApplicationError with reason from response body', () => {
      const { errors } = loadChatUsers();

      flushRejection(httpTestingController.expectOne('/chats/1/users'));

      expect(errors).toHaveLength(1);
      expect(errors[0]).toBeInstanceOf(ApplicationError);
      expect(errors[0].message).toBe('mockReason');
    });

    it('should map generic error to ApplicationError with fallback message', () => {
      const { errors } = loadChatUsers();

      flushServerFailure(httpTestingController.expectOne('/chats/1/users'));

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe(CHAT_ERROR_MESSAGES.chatUsers);
    });
  });

  describe('deleteChat', () => {
    it('should send DELETE request with the chat id in the body', () => {
      service.deleteChat({ chatId: 1 }).subscribe();

      const request = httpTestingController.expectOne('/chats');

      expect(request.request.method).toBe('DELETE');
      expect(request.request.body).toEqual({ chatId: 1 });

      request.flush(null);
    });

    it('should turn a rejected request into an application error', () => {
      const errors: ApplicationError[] = [];

      service.deleteChat({ chatId: 1 }).subscribe({
        error: (applicationError: ApplicationError) => errors.push(applicationError),
      });

      flushServerFailure(httpTestingController.expectOne('/chats'));

      expect(errors).toHaveLength(1);
      expect(errors[0]).toBeInstanceOf(ApplicationError);
      expect(errors[0].message).toBe(CHAT_ERROR_MESSAGES.deleteChat);
    });
  });

  describe('addChatUser', () => {
    const addChatUser = (): { results: unknown[]; errors: ApplicationError[] } => {
      const results: unknown[] = [];
      const errors: ApplicationError[] = [];

      service.addChatUser({ chatId: 1, userId: 2 }).subscribe({
        next: (result) => results.push(result),
        error: (applicationError: ApplicationError) => errors.push(applicationError),
      });

      return { results, errors };
    };

    it('should send PUT request with the chat id and user ids as text', () => {
      addChatUser();

      const request = httpTestingController.expectOne('/chats/users');

      expect(request.request.method).toBe('PUT');
      expect(request.request.body).toEqual({ chatId: 1, users: [2] });
      expect(request.request.responseType).toBe('text');

      request.flush('OK');
    });

    it('should map response to a success result', () => {
      const { results } = addChatUser();

      httpTestingController.expectOne('/chats/users').flush('OK');

      expect(results).toEqual([{ userAdded: true }]);
    });

    it('should map error to ApplicationError with reason from response body', () => {
      const { errors } = addChatUser();

      flushRejection(httpTestingController.expectOne('/chats/users'));

      expect(errors).toHaveLength(1);
      expect(errors[0]).toBeInstanceOf(ApplicationError);
      expect(errors[0].message).toBe('mockReason');
    });

    it('should map generic error to ApplicationError with fallback message', () => {
      const { errors } = addChatUser();

      flushServerFailure(httpTestingController.expectOne('/chats/users'));

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe(CHAT_ERROR_MESSAGES.addChatUser);
    });
  });

  describe('removeChatUser', () => {
    const removeChatUser = (): { results: unknown[]; errors: ApplicationError[] } => {
      const results: unknown[] = [];
      const errors: ApplicationError[] = [];

      service.removeChatUser({ chatId: 1, userId: 2 }).subscribe({
        next: (result) => results.push(result),
        error: (applicationError: ApplicationError) => errors.push(applicationError),
      });

      return { results, errors };
    };

    it('should send DELETE request with the chat id and user ids as text', () => {
      removeChatUser();

      const request = httpTestingController.expectOne('/chats/users');

      expect(request.request.method).toBe('DELETE');
      expect(request.request.body).toEqual({ chatId: 1, users: [2] });
      expect(request.request.responseType).toBe('text');

      request.flush('OK');
    });

    it('should emit once when the user is removed', () => {
      const { results } = removeChatUser();

      httpTestingController.expectOne('/chats/users').flush('OK');

      expect(results).toHaveLength(1);
    });

    it('should map error to ApplicationError with reason from response body', () => {
      const { errors } = removeChatUser();

      flushRejection(httpTestingController.expectOne('/chats/users'));

      expect(errors).toHaveLength(1);
      expect(errors[0]).toBeInstanceOf(ApplicationError);
      expect(errors[0].message).toBe('mockReason');
    });

    it('should map generic error to ApplicationError with fallback message', () => {
      const { errors } = removeChatUser();

      flushServerFailure(httpTestingController.expectOne('/chats/users'));

      expect(errors).toHaveLength(1);
      expect(errors[0]).toBeInstanceOf(ApplicationError);
      expect(errors[0].message).toBe(CHAT_ERROR_MESSAGES.removeChatUser);
    });
  });
});

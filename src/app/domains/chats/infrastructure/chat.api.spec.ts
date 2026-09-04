import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ChatApi } from './chat.api';
import { ChatDto, ChatUserDto } from './chat.dto';

const chatDtoMock: ChatDto = {
  id: 1,
  title: 'Analytics Q3',
  avatar: null,
  unread_count: 0,
  last_message: null,
};

const chatUserDtoMock: ChatUserDto = {
  id: 2,
  first_name: 'John',
  second_name: 'Doe',
  display_name: 'Johnny',
  login: 'john.doe',
  avatar: null,
};

describe('ChatApi', () => {
  let service: ChatApi;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ChatApi);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('chats', () => {
    it('should send GET request to relative url', () => {
      const results: unknown[] = [];

      service.chats().subscribe((response) => {
        results.push(response);
      });

      const request = httpTestingController.expectOne('/chats');

      expect(request.request.method).toBe('GET');

      request.flush([chatDtoMock]);

      expect(results).toEqual([[chatDtoMock]]);
    });
  });

  describe('createChat', () => {
    it('should send POST request with the title', () => {
      const results: unknown[] = [];

      service.createChat({ title: 'Analytics Q3' }).subscribe((response) => {
        results.push(response);
      });

      const request = httpTestingController.expectOne('/chats');

      expect(request.request.method).toBe('POST');
      expect(request.request.body).toEqual({ title: 'Analytics Q3' });

      request.flush({ id: 1 });

      expect(results).toEqual([{ id: 1 }]);
    });
  });

  describe('chatUsers', () => {
    it('should send GET request to the chat users url', () => {
      const results: unknown[] = [];

      service.chatUsers(1).subscribe((response) => {
        results.push(response);
      });

      const request = httpTestingController.expectOne('/chats/1/users');

      expect(request.request.method).toBe('GET');

      request.flush([chatUserDtoMock]);

      expect(results).toEqual([[chatUserDtoMock]]);
    });
  });
});

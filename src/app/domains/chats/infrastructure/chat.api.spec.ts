import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ChatApi } from './chat.api';
import { ChatDto } from './chat.dto';

const chatDtoMock: ChatDto = {
  id: 1,
  title: 'Analytics Q3',
  avatar: null,
  unread_count: 0,
  last_message: null,
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
});

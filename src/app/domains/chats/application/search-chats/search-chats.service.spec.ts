import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { CHAT_GATEWAY } from '../chat.gateway';
import { Chat } from '../chat.type';

import { SearchChatsService } from './search-chats.service';

import { ApplicationError } from '@shared/errors';

const chatGatewayMock = {
  chats: vi.fn(),
};

const chatMock: Chat = {
  id: 2,
  title: 'Backend backlog',
  avatar: null,
  unreadCount: 0,
  createdBy: 1,
  lastMessage: null,
};

describe('SearchChatsService', () => {
  let service: SearchChatsService;

  beforeEach(() => {
    chatGatewayMock.chats.mockReset();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: CHAT_GATEWAY,
          useValue: chatGatewayMock,
        },
        SearchChatsService,
      ],
    });

    service = TestBed.inject(SearchChatsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('searchChats', () => {
    it('should ask the chat gateway for the given title', () => {
      chatGatewayMock.chats.mockReturnValue(of([chatMock]));

      service.searchChats('back').subscribe();

      expect(chatGatewayMock.chats).toHaveBeenCalledOnce();
      expect(chatGatewayMock.chats).toHaveBeenCalledWith({ title: 'back' });
    });

    describe('when chats are found', () => {
      it('should emit the found chats as they are', () => {
        chatGatewayMock.chats.mockReturnValue(of([chatMock]));

        const results: Chat[][] = [];

        service.searchChats('back').subscribe((chats) => {
          results.push(chats);
        });

        expect(results).toEqual([[chatMock]]);
      });
    });

    describe('when nothing matches', () => {
      it('should emit an empty result instead of an error', () => {
        chatGatewayMock.chats.mockReturnValue(of([]));

        const results: Chat[][] = [];
        const errors: ApplicationError[] = [];

        service.searchChats('nobody').subscribe({
          next: (chats) => {
            results.push(chats);
          },
          error: (applicationError: ApplicationError) => {
            errors.push(applicationError);
          },
        });

        expect(results).toEqual([[]]);
        expect(errors).toHaveLength(0);
      });
    });

    describe('when the search fails', () => {
      it('should emit the application error', () => {
        chatGatewayMock.chats.mockReturnValue(throwError(() => new ApplicationError('mockReason')));

        const errors: ApplicationError[] = [];

        service.searchChats('back').subscribe({
          error: (applicationError: ApplicationError) => {
            errors.push(applicationError);
          },
        });

        expect(errors).toHaveLength(1);
        expect(errors[0]).toBeInstanceOf(ApplicationError);
        expect(errors[0].message).toBe('mockReason');
      });
    });
  });
});

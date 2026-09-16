import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';

import { Chat } from '../chat.type';
import { SearchChatsService } from '../search-chats/search-chats.service';

import { ChatSearchStatus } from './chat-search-status.type';
import { createChatSearchState, ChatSearchState } from './chat-search.state';

const searchChatsServiceMock = {
  searchChats: vi.fn(),
} as unknown as SearchChatsService;

const chatMock: Chat = {
  id: 2,
  title: 'Backend backlog',
  avatar: null,
  unreadCount: 0,
  createdBy: 1,
  lastMessage: null,
};

const debounceMs = 300;

describe('createChatSearchState', () => {
  let title$: Subject<string>;
  let state: ChatSearchState;

  const search = (title: string): void => {
    title$.next(title);
    vi.advanceTimersByTime(debounceMs);
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(searchChatsServiceMock.searchChats).mockReset();

    title$ = new Subject<string>();

    TestBed.configureTestingModule({});

    state = TestBed.runInInjectionContext(() =>
      createChatSearchState(searchChatsServiceMock, title$),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    TestBed.resetTestingModule();
  });

  describe('search not started', () => {
    it('should expose no chats and send no request', () => {
      expect(state.result()).toEqual({ status: ChatSearchStatus.NotStarted });
      expect(searchChatsServiceMock.searchChats).not.toHaveBeenCalled();
    });

    it('should go back to not started when the query is cleared', () => {
      vi.mocked(searchChatsServiceMock.searchChats).mockReturnValue(of([chatMock]));

      search('back');

      expect(state.result()).toEqual({
        status: ChatSearchStatus.Found,
        chats: [chatMock],
      });

      search('');

      expect(state.result()).toEqual({ status: ChatSearchStatus.NotStarted });
    });
  });

  describe('chats found', () => {
    it('should expose the found chats after the debounce delay', () => {
      vi.mocked(searchChatsServiceMock.searchChats).mockReturnValue(new Subject<Chat[]>());

      title$.next('back');

      expect(searchChatsServiceMock.searchChats).not.toHaveBeenCalled();

      vi.mocked(searchChatsServiceMock.searchChats).mockReturnValue(of([chatMock]));

      vi.advanceTimersByTime(debounceMs);

      expect(searchChatsServiceMock.searchChats).toHaveBeenCalledWith('back');
      expect(state.result()).toEqual({
        status: ChatSearchStatus.Found,
        chats: [chatMock],
      });
    });
  });

  describe('nothing found', () => {
    it('should expose a nothing found result, distinct from not started', () => {
      vi.mocked(searchChatsServiceMock.searchChats).mockReturnValue(of([]));

      search('nobody');

      expect(state.result()).toEqual({ status: ChatSearchStatus.NothingFound });
    });
  });

  describe('the external api refuses', () => {
    it('should expose a nothing found result and let the next input search again', () => {
      const failingResponse$ = new Subject<Chat[]>();

      vi.mocked(searchChatsServiceMock.searchChats).mockReturnValueOnce(failingResponse$);

      search('back');

      failingResponse$.error(new Error('mockReason'));

      expect(state.result()).toEqual({ status: ChatSearchStatus.NothingFound });

      vi.mocked(searchChatsServiceMock.searchChats).mockReturnValue(of([chatMock]));

      search('backend');

      expect(searchChatsServiceMock.searchChats).toHaveBeenCalledWith('backend');
      expect(state.result()).toEqual({
        status: ChatSearchStatus.Found,
        chats: [chatMock],
      });
    });
  });

  describe('input continued before the response', () => {
    it('should show the result of the last query and ignore a late response to a previous one', () => {
      const firstResponse$ = new Subject<Chat[]>();
      const secondResponse$ = new Subject<Chat[]>();

      vi.mocked(searchChatsServiceMock.searchChats)
        .mockReturnValueOnce(firstResponse$)
        .mockReturnValueOnce(secondResponse$);

      search('ba');
      search('back');

      secondResponse$.next([chatMock]);
      firstResponse$.next([]);

      expect(state.result()).toEqual({
        status: ChatSearchStatus.Found,
        chats: [chatMock],
      });
    });
  });

  describe('the request delay', () => {
    it('should send the request only after the debounce delay', () => {
      vi.mocked(searchChatsServiceMock.searchChats).mockReturnValue(of([chatMock]));

      title$.next('back');

      expect(searchChatsServiceMock.searchChats).not.toHaveBeenCalled();

      vi.advanceTimersByTime(debounceMs);

      expect(searchChatsServiceMock.searchChats).toHaveBeenCalledWith('back');
    });
  });
});

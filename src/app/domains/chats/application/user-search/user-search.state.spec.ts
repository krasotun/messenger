import { of, Subject } from 'rxjs';

import { UserSearchStatus } from './user-search-status';
import { createUserSearchState } from './user-search.state';

import { SearchUsersResult, SearchUsersService, User } from '@domains/identity-access';

const searchUsersServiceMock = {
  searchUsers: vi.fn(),
} as unknown as SearchUsersService;

const userMock: User = {
  id: 2,
  login: 'jane.roe',
  name: 'Janie',
  avatar: null,
};

describe('createUserSearchState', () => {
  let state: ReturnType<typeof createUserSearchState>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(searchUsersServiceMock.searchUsers).mockReset();

    state = createUserSearchState(searchUsersServiceMock);
  });

  afterEach(() => {
    state.destroy();
    vi.useRealTimers();
  });

  describe('поиск не начат', () => {
    it('should start with an empty query and no request', () => {
      expect(state.status()).toBe(UserSearchStatus.NotStarted);
      expect(state.users()).toEqual([]);
      expect(searchUsersServiceMock.searchUsers).not.toHaveBeenCalled();
    });

    it('should go back to not started when the query is cleared', () => {
      vi.mocked(searchUsersServiceMock.searchUsers).mockReturnValue(
        new Subject<SearchUsersResult>(),
      );

      state.search('jane');
      vi.advanceTimersByTime(1000);

      state.search('');

      expect(state.status()).toBe(UserSearchStatus.NotStarted);
      expect(state.users()).toEqual([]);
    });
  });

  describe('пользователи найдены', () => {
    it('should expose the found users after the debounce delay', () => {
      vi.mocked(searchUsersServiceMock.searchUsers).mockReturnValue(
        new Subject<SearchUsersResult>(),
      );

      state.search('jane');

      expect(searchUsersServiceMock.searchUsers).not.toHaveBeenCalled();

      vi.mocked(searchUsersServiceMock.searchUsers).mockReturnValue(of({ users: [userMock] }));

      vi.advanceTimersByTime(1000);

      expect(searchUsersServiceMock.searchUsers).toHaveBeenCalledWith({ login: 'jane' });
      expect(state.status()).toBe(UserSearchStatus.Found);
      expect(state.users()).toEqual([userMock]);
    });
  });

  describe('никого не нашли', () => {
    it('should expose the empty status, distinct from not started', () => {
      vi.mocked(searchUsersServiceMock.searchUsers).mockReturnValue(of({ users: [] }));

      state.search('nobody');
      vi.advanceTimersByTime(1000);

      expect(state.status()).toBe(UserSearchStatus.Empty);
      expect(state.status()).not.toBe(UserSearchStatus.NotStarted);
      expect(state.users()).toEqual([]);
    });
  });

  describe('ввод продолжился до ответа', () => {
    it('should show the result of the last query and ignore a late response to a previous one', () => {
      const firstResponse$ = new Subject<SearchUsersResult>();
      const secondResponse$ = new Subject<SearchUsersResult>();

      vi.mocked(searchUsersServiceMock.searchUsers)
        .mockReturnValueOnce(firstResponse$)
        .mockReturnValueOnce(secondResponse$);

      state.search('ja');
      vi.advanceTimersByTime(1000);

      state.search('jane');
      vi.advanceTimersByTime(1000);

      secondResponse$.next({ users: [userMock] });
      firstResponse$.next({ users: [] });

      expect(state.status()).toBe(UserSearchStatus.Found);
      expect(state.users()).toEqual([userMock]);
    });
  });
});

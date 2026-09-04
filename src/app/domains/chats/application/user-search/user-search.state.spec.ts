import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';

import { UserSearchStatus } from './user-search-status';
import { createUserSearchState, UserSearchState } from './user-search.state';

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

const debounceMs = 300;

describe('createUserSearchState', () => {
  let login$: Subject<string>;
  let state: UserSearchState;

  const search = (login: string): void => {
    login$.next(login);
    vi.advanceTimersByTime(debounceMs);
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(searchUsersServiceMock.searchUsers).mockReset();

    login$ = new Subject<string>();

    TestBed.configureTestingModule({});

    state = TestBed.runInInjectionContext(() =>
      createUserSearchState(searchUsersServiceMock, login$),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    TestBed.resetTestingModule();
  });

  describe('поиск не начат', () => {
    it('should expose no users and send no request', () => {
      expect(state.result()).toEqual({ status: UserSearchStatus.NotStarted });
      expect(searchUsersServiceMock.searchUsers).not.toHaveBeenCalled();
    });

    it('should go back to not started when the query is cleared', () => {
      vi.mocked(searchUsersServiceMock.searchUsers).mockReturnValue(of({ users: [userMock] }));

      search('jane');

      expect(state.result()).toEqual({ status: UserSearchStatus.Found, users: [userMock] });

      search('');

      expect(state.result()).toEqual({ status: UserSearchStatus.NotStarted });
    });
  });

  describe('пользователи найдены', () => {
    it('should expose the found users after the debounce delay', () => {
      vi.mocked(searchUsersServiceMock.searchUsers).mockReturnValue(
        new Subject<SearchUsersResult>(),
      );

      login$.next('jane');

      expect(searchUsersServiceMock.searchUsers).not.toHaveBeenCalled();

      vi.mocked(searchUsersServiceMock.searchUsers).mockReturnValue(of({ users: [userMock] }));

      vi.advanceTimersByTime(debounceMs);

      expect(searchUsersServiceMock.searchUsers).toHaveBeenCalledWith({ login: 'jane' });
      expect(state.result()).toEqual({ status: UserSearchStatus.Found, users: [userMock] });
    });
  });

  describe('никого не нашли', () => {
    it('should expose a nobody found result, distinct from not started', () => {
      vi.mocked(searchUsersServiceMock.searchUsers).mockReturnValue(of({ users: [] }));

      search('nobody');

      expect(state.result()).toEqual({ status: UserSearchStatus.NobodyFound });
    });
  });

  describe('ввод продолжился до ответа', () => {
    it('should show the result of the last query and ignore a late response to a previous one', () => {
      const firstResponse$ = new Subject<SearchUsersResult>();
      const secondResponse$ = new Subject<SearchUsersResult>();

      vi.mocked(searchUsersServiceMock.searchUsers)
        .mockReturnValueOnce(firstResponse$)
        .mockReturnValueOnce(secondResponse$);

      search('ja');
      search('jane');

      secondResponse$.next({ users: [userMock] });
      firstResponse$.next({ users: [] });

      expect(state.result()).toEqual({ status: UserSearchStatus.Found, users: [userMock] });
    });
  });
});

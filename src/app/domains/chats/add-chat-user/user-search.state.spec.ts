import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';

import { UserSearchStatus } from './user-search-status.type';
import { createUserSearchState, UserSearchState } from './user-search.state';

import { SearchUsersResult, SearchUsersService } from '@domains/identity-access';
import { IdentityMocks } from '@domains/identity-access/testing';

const userMock = IdentityMocks.user({ login: 'jane.roe', name: 'Janie' });

const debounceMs = 300;

describe('createUserSearchState', () => {
  let login$: Subject<string>;
  let state: UserSearchState;
  let searchUsersServiceMock: ReturnType<typeof IdentityMocks.searchUsersService>;

  const search = (login: string): void => {
    login$.next(login);
    vi.advanceTimersByTime(debounceMs);
  };

  beforeEach(() => {
    vi.useFakeTimers();
    searchUsersServiceMock = IdentityMocks.searchUsersService();

    login$ = new Subject<string>();

    TestBed.configureTestingModule({});

    state = TestBed.runInInjectionContext(() =>
      createUserSearchState(searchUsersServiceMock as unknown as SearchUsersService, login$),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    TestBed.resetTestingModule();
  });

  describe('search not started', () => {
    it('should expose no users and send no request', () => {
      expect(state.result()).toEqual({ status: UserSearchStatus.NotStarted });
      expect(searchUsersServiceMock.searchUsers).not.toHaveBeenCalled();
    });

    it('should go back to not started when the query is cleared', () => {
      searchUsersServiceMock.searchUsers.mockReturnValue(of({ users: [userMock] }));

      search('jane');

      expect(state.result()).toEqual({ status: UserSearchStatus.Found, users: [userMock] });

      search('');

      expect(state.result()).toEqual({ status: UserSearchStatus.NotStarted });
    });
  });

  describe('users found', () => {
    it('should expose the found users after the debounce delay', () => {
      searchUsersServiceMock.searchUsers.mockReturnValue(new Subject<SearchUsersResult>());

      login$.next('jane');

      expect(searchUsersServiceMock.searchUsers).not.toHaveBeenCalled();

      searchUsersServiceMock.searchUsers.mockReturnValue(of({ users: [userMock] }));

      vi.advanceTimersByTime(debounceMs);

      expect(searchUsersServiceMock.searchUsers).toHaveBeenCalledWith({ login: 'jane' });
      expect(state.result()).toEqual({ status: UserSearchStatus.Found, users: [userMock] });
    });
  });

  describe('nobody found', () => {
    it('should expose a nobody found result, distinct from not started', () => {
      searchUsersServiceMock.searchUsers.mockReturnValue(of({ users: [] }));

      search('nobody');

      expect(state.result()).toEqual({ status: UserSearchStatus.NobodyFound });
    });
  });

  describe('input continued before the response', () => {
    it('should show the result of the last query and ignore a late response to a previous one', () => {
      const firstResponse$ = new Subject<SearchUsersResult>();
      const secondResponse$ = new Subject<SearchUsersResult>();

      searchUsersServiceMock.searchUsers
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

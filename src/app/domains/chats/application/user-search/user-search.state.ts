import { signal } from '@angular/core';
import { catchError, debounceTime, filter, of, Subject, switchMap, tap } from 'rxjs';

import { UserSearchStatus } from './user-search-status';

import { SearchUsersResult, SearchUsersService, User } from '@domains/identity-access';

const searchDebounceMs = 300;

export const createUserSearchState = (searchUsersService: SearchUsersService) => {
  const status = signal<UserSearchStatus>(UserSearchStatus.NotStarted);
  const users = signal<User[]>([]);

  const login$ = new Subject<string>();

  const subscription = login$
    .pipe(
      tap((login) => {
        if (!login) {
          status.set(UserSearchStatus.NotStarted);
          users.set([]);
        }
      }),
      filter((login) => login.length > 0),
      debounceTime(searchDebounceMs),
      tap(() => status.set(UserSearchStatus.Searching)),
      switchMap((login) =>
        searchUsersService.searchUsers({ login }).pipe(
          // Отказ поиска здесь не показывается отдельно: chats-спека не
          // описывает такое состояние панели, поэтому он схлопывается в
          // «Никого не нашли», не ломая последующий ввод.
          catchError(() => of<SearchUsersResult>({ users: [] })),
        ),
      ),
    )
    .subscribe(({ users: foundUsers }) => {
      users.set(foundUsers);
      status.set(foundUsers.length > 0 ? UserSearchStatus.Found : UserSearchStatus.Empty);
    });

  const search = (login: string): void => {
    login$.next(login);
  };

  const destroy = (): void => {
    subscription.unsubscribe();
  };

  return {
    status: status.asReadonly(),
    users: users.asReadonly(),
    search,
    destroy,
  };
};

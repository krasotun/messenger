import { signal, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, map, Observable, of, switchMap } from 'rxjs';

import { UserSearchStatus } from './user-search-status';

import { SearchUsersService, User } from '@domains/identity-access';

const searchDebounceMs = 300;

export type UserSearchResult =
  | { status: UserSearchStatus.NotStarted }
  | { status: UserSearchStatus.Found; users: User[] }
  | { status: UserSearchStatus.NobodyFound };

export interface UserSearchState {
  result: Signal<UserSearchResult>;
}

const notStarted: UserSearchResult = { status: UserSearchStatus.NotStarted };
const nobodyFound: UserSearchResult = { status: UserSearchStatus.NobodyFound };

const toResult = (users: User[]): UserSearchResult =>
  users.length === 0 ? nobodyFound : { status: UserSearchStatus.Found, users };

export const createUserSearchState = (
  searchUsersService: SearchUsersService,
  login$: Observable<string>,
): UserSearchState => {
  const result = signal<UserSearchResult>(notStarted);

  login$
    .pipe(
      debounceTime(searchDebounceMs),
      switchMap((login) => {
        if (!login) {
          return of(notStarted);
        }

        return searchUsersService.searchUsers({ login }).pipe(
          map(({ users }) => toResult(users)),
          // Отказ поиска здесь не показывается отдельно: chats-спека не
          // описывает такое состояние панели, поэтому он схлопывается в
          // «Никого не нашли», не ломая последующий ввод.
          catchError(() => of(nobodyFound)),
        );
      }),
      takeUntilDestroyed(),
    )
    .subscribe((searchResult) => {
      result.set(searchResult);
    });

  return { result: result.asReadonly() };
};

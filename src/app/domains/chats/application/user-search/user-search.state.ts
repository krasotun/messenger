import { signal, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, map, Observable, of, switchMap } from 'rxjs';

import { SearchUsersService, User } from '@domains/identity-access';
import { Nullable } from '@shared/types';

const searchDebounceMs = 300;

export interface UserSearchState {
  // null - поиск еще не начат; пустой массив - искали и никого не нашли.
  users: Signal<Nullable<User[]>>;
}

export const createUserSearchState = (
  searchUsersService: SearchUsersService,
  login$: Observable<string>,
): UserSearchState => {
  const users = signal<Nullable<User[]>>(null);

  login$
    .pipe(
      debounceTime(searchDebounceMs),
      switchMap((login) => {
        if (!login) {
          return of(null);
        }

        return searchUsersService.searchUsers({ login }).pipe(
          map((result) => result.users),
          // Отказ поиска здесь не показывается отдельно: chats-спека не
          // описывает такое состояние панели, поэтому он схлопывается в
          // «Никого не нашли», не ломая последующий ввод.
          catchError(() => of([])),
        );
      }),
      takeUntilDestroyed(),
    )
    .subscribe((foundUsers) => {
      users.set(foundUsers);
    });

  return { users: users.asReadonly() };
};

import { signal, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, map, Observable, of, switchMap } from 'rxjs';

import { Chat } from '../chat.type';
import { SearchChatsService } from '../search-chats/search-chats.service';

import { ChatSearchStatus } from './chat-search-status.type';

const searchDebounceMs = 300;

export type ChatSearchResult =
  | { status: ChatSearchStatus.NotStarted }
  | { status: ChatSearchStatus.Found; chats: Chat[] }
  | { status: ChatSearchStatus.NothingFound };

export interface ChatSearchState {
  result: Signal<ChatSearchResult>;
}

const notStarted: ChatSearchResult = { status: ChatSearchStatus.NotStarted };
const nothingFound: ChatSearchResult = { status: ChatSearchStatus.NothingFound };

const toResult = (chats: Chat[]): ChatSearchResult =>
  chats.length === 0 ? nothingFound : { status: ChatSearchStatus.Found, chats };

export const createChatSearchState = (
  searchChatsService: SearchChatsService,
  title$: Observable<string>,
): ChatSearchState => {
  const result = signal<ChatSearchResult>(notStarted);

  title$
    .pipe(
      debounceTime(searchDebounceMs),
      switchMap((title) => {
        if (!title) {
          return of(notStarted);
        }

        return searchChatsService.searchChats(title).pipe(
          map((chats) => toResult(chats)),
          // Отказ поиска здесь не показывается отдельно: chats-спека не
          // описывает такое состояние панели, поэтому он схлопывается в
          // «Чатов не найдено», не ломая последующий ввод.
          catchError(() => of(nothingFound)),
        );
      }),
      takeUntilDestroyed(),
    )
    .subscribe((searchResult) => {
      result.set(searchResult);
    });

  return { result: result.asReadonly() };
};

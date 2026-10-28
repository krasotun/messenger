import { computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, Observable, Subject, switchMap, tap } from 'rxjs';

import { ChatUser } from '../chat-user.type';
import { CHAT_GATEWAY } from '../chat.gateway';

import { ApplicationError } from '@shared/errors';
import { LoadStatus } from '@shared/types';

type ChatUsersState =
  | { status: LoadStatus.Idle }
  | { status: LoadStatus.Loading }
  | { status: LoadStatus.Loaded; chatUsers: ChatUser[] }
  | { status: LoadStatus.Error; errorMessage: string };

@Injectable({
  providedIn: 'root',
})
export class ChatUsersService {
  private readonly _chatGateway = inject(CHAT_GATEWAY);

  private readonly _requestedChatId$ = new Subject<number>();

  private readonly _state = signal<ChatUsersState>({ status: LoadStatus.Idle });

  readonly status = computed(() => this._state().status);

  readonly chatUsers = computed(() => {
    const state = this._state();

    return state.status === LoadStatus.Loaded ? state.chatUsers : [];
  });

  readonly errorMessage = computed(() => {
    const state = this._state();

    return state.status === LoadStatus.Error ? state.errorMessage : null;
  });

  constructor() {
    this._requestedChatId$
      .pipe(
        switchMap((chatId) => this._requestChatUsers(chatId)),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  loadChatUsers(chatId: number): void {
    this._state.set({ status: LoadStatus.Loading });

    this._requestedChatId$.next(chatId);
  }

  private _requestChatUsers(chatId: number): Observable<ChatUser[]> {
    return this._chatGateway.chatUsers(chatId).pipe(
      tap({
        next: (chatUsers) => {
          this._state.set({ status: LoadStatus.Loaded, chatUsers });
        },
        error: ({ message }: ApplicationError) => {
          this._state.set({ status: LoadStatus.Error, errorMessage: message });
        },
      }),
      catchError(() => EMPTY),
    );
  }
}

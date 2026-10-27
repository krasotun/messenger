import { computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, Observable, Subject, switchMap, tap } from 'rxjs';

import { ChatUser } from '../chat-user.type';
import { CHAT_GATEWAY } from '../chat.gateway';

import { ChatUsersStatus } from './chat-users-status.type';

import { ApplicationError } from '@shared/errors';
import { Nullable } from '@shared/types';

@Injectable({
  providedIn: 'root',
})
export class ChatUsersService {
  private readonly _chatGateway = inject(CHAT_GATEWAY);

  private readonly _requestedChatId$ = new Subject<number>();

  private readonly _status = signal<ChatUsersStatus>(ChatUsersStatus.Idle);
  readonly status = this._status.asReadonly();

  private readonly _chatUsers = signal<ChatUser[]>([]);
  readonly chatUsers = this._chatUsers.asReadonly();

  private readonly _errorMessage = signal<Nullable<string>>(null);
  readonly errorMessage = this._errorMessage.asReadonly();

  readonly isLoading = computed(() => this._status() === ChatUsersStatus.Loading);

  constructor() {
    this._requestedChatId$
      .pipe(
        switchMap((chatId) => this._requestChatUsers(chatId)),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  loadChatUsers(chatId: number): void {
    this._status.set(ChatUsersStatus.Loading);
    this._errorMessage.set(null);

    this._requestedChatId$.next(chatId);
  }

  private _requestChatUsers(chatId: number): Observable<ChatUser[]> {
    return this._chatGateway.chatUsers(chatId).pipe(
      tap({
        next: (chatUsers) => {
          this._chatUsers.set(chatUsers);
          this._status.set(ChatUsersStatus.Loaded);
        },
        error: ({ message }: ApplicationError) => {
          this._errorMessage.set(message);
          this._status.set(ChatUsersStatus.Error);
        },
      }),
      catchError(() => EMPTY),
    );
  }
}

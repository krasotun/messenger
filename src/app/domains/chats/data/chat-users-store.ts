import { computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, Observable, Subject, switchMap, tap } from 'rxjs';

import {
  AddChatUserInput,
  CHAT_GATEWAY,
  RemoveChatUserInput,
} from '@domains/chats/data/chat-gateway';
import { ChatUser } from '@domains/chats/data/chat-user';
import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
import { createActionFlowState, createFormSubmitFlowState } from '@shared/submit-flow';
import { LoadStatus } from '@shared/types';

type ChatUsersState =
  | { status: LoadStatus.Idle }
  | { status: LoadStatus.Loading }
  | { status: LoadStatus.Loaded; chatUsers: ChatUser[] }
  | { status: LoadStatus.Error; errorMessage: string };

@Injectable()
export class ChatUsersStore {
  private readonly _chatGateway = inject(CHAT_GATEWAY);
  private readonly _notifier = inject(NOTIFIER);

  private readonly _chatUserAdditionFlow = createFormSubmitFlowState();

  readonly chatUserAdditionFlow = {
    isSubmitting: this._chatUserAdditionFlow.isSubmitting,
    succeeded$: this._chatUserAdditionFlow.succeeded$,
  };

  private readonly _chatUserRemovalFlow = createActionFlowState();

  readonly chatUserRemovalFlow = {
    succeeded$: this._chatUserRemovalFlow.succeeded$,
  };

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

  addChatUser(addChatUserInput: AddChatUserInput): void {
    this._chatUserAdditionFlow.startSubmitting();

    this._chatGateway.addChatUser(addChatUserInput).subscribe({
      next: () => {
        this.loadChatUsers(addChatUserInput.chatId);
        this._chatUserAdditionFlow.markSuccess();
      },
      error: ({ message }: ApplicationError) => {
        this._chatUserAdditionFlow.markError();
        this._notifier.error('Failed to add chat user', message);
      },
    });
  }

  removeChatUser(removeChatUserInput: RemoveChatUserInput): void {
    this._chatGateway.removeChatUser(removeChatUserInput).subscribe({
      next: () => {
        this.loadChatUsers(removeChatUserInput.chatId);
        this._chatUserRemovalFlow.markSuccess();
        this._notifier.success('Remove member', 'Member removed');
      },
      error: ({ message }: ApplicationError) => {
        this._notifier.error('Failed to remove member', message);
      },
    });
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

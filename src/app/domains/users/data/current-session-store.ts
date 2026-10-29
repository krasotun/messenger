import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, switchMap, tap, throwError } from 'rxjs';

import { AUTH_GATEWAY, CurrentSessionResult, SignInInput, SignUpInput } from './auth-gateway';
import { CurrentSessionStatus } from './current-session-status';
import { CurrentUser } from './current-user';

import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
import { FormSubmitFlowState } from '@shared/submit-flow';

type CurrentSessionState =
  | { status: CurrentSessionStatus.Unknown }
  | { status: CurrentSessionStatus.Loading }
  | CurrentSessionResult;

@Injectable({
  providedIn: 'root',
})
export class CurrentSessionStore {
  private readonly _authGateway = inject(AUTH_GATEWAY);
  private readonly _notifier = inject(NOTIFIER);

  private readonly _state = signal<CurrentSessionState>({ status: CurrentSessionStatus.Unknown });

  readonly status = computed(() => this._state().status);

  readonly currentUser = computed(() => {
    const state = this._state();

    return state.status === CurrentSessionStatus.Authenticated ? state.user : null;
  });

  signIn(signInInput: SignInInput, signInFlow: FormSubmitFlowState): void {
    signInFlow.startSubmitting();

    this._authGateway
      .signIn(signInInput)
      .pipe(switchMap(() => this.restoreCurrentSession()))
      .subscribe({
        next: ({ status }) => {
          if (status === CurrentSessionStatus.Authenticated) {
            signInFlow.markSuccess();
            return;
          }

          signInFlow.markError();
          this._notifier.error('Sign-in failed', 'Login failed. Please try again later');
        },
        error: ({ message }: ApplicationError) => {
          signInFlow.markError();
          this._notifier.error('Sign-in failed', message);
        },
      });
  }

  signUp(signUpInput: SignUpInput, signUpFlow: FormSubmitFlowState): void {
    signUpFlow.startSubmitting();

    this._authGateway.signUp(signUpInput).subscribe({
      next: () => {
        signUpFlow.markSuccess();
      },
      error: ({ message }: ApplicationError) => {
        signUpFlow.markError();
        this._notifier.error('Sign-up failed', message);
      },
    });
  }

  restoreCurrentSession(): Observable<CurrentSessionResult> {
    this._state.set({ status: CurrentSessionStatus.Loading });

    return this._authGateway.currentSession().pipe(
      tap((result) => {
        this._state.set(result);
      }),
      catchError((error) => {
        this._markAnonymous();
        return throwError(() => error);
      }),
    );
  }

  updateCurrentUser(currentUser: CurrentUser): void {
    const state = this._state();

    if (state.status !== CurrentSessionStatus.Authenticated) {
      throw new Error('Cannot update the current user without an authenticated session');
    }

    this._state.set({ ...state, user: currentUser });
  }

  logout(): Observable<void> {
    return this._authGateway.logout().pipe(
      tap(() => {
        this._markAnonymous();
      }),

      catchError((error) => {
        this._markAnonymous();
        return throwError(() => error);
      }),
    );
  }

  private _markAnonymous(): void {
    this._state.set({ status: CurrentSessionStatus.Anonymous });
  }
}

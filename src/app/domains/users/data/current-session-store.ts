import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, EMPTY, filter, map, Observable, switchMap, tap, throwError } from 'rxjs';

import { AUTH_GATEWAY, CurrentSessionResult, SignInInput, SignUpInput } from './auth-gateway';
import { CurrentSessionStatus } from './current-session-status';
import { CurrentUser } from './current-user';
import { ChangeAvatarInput, ChangePasswordInput, USER_GATEWAY } from './user-gateway';

import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
import { FormSubmitFlowState } from '@shared/submit-flow';

type AuthenticatedSession = Extract<
  CurrentSessionResult,
  { status: CurrentSessionStatus.Authenticated }
>;

type CurrentSessionState =
  | { status: CurrentSessionStatus.Unknown }
  | { status: CurrentSessionStatus.Loading }
  | CurrentSessionResult;

@Injectable({
  providedIn: 'root',
})
export class CurrentSessionStore {
  private readonly _authGateway = inject(AUTH_GATEWAY);
  private readonly _userGateway = inject(USER_GATEWAY);
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

  changeAvatar(changeAvatarInput: ChangeAvatarInput, changeAvatarFlow: FormSubmitFlowState): void {
    changeAvatarFlow.startSubmitting();

    this._userGateway.changeAvatar(changeAvatarInput).subscribe({
      next: ({ user }) => {
        this.updateCurrentUser(user);
        changeAvatarFlow.markSuccess();
        this._notifier.success('Change avatar', 'Avatar changed successfully');
      },
      error: ({ message }: ApplicationError) => {
        changeAvatarFlow.markError();
        this._notifier.error('Failed to change avatar', message);
      },
    });
  }

  changePassword(
    changePasswordInput: ChangePasswordInput,
    changePasswordFlow: FormSubmitFlowState,
  ): void {
    changePasswordFlow.startSubmitting();

    this._userGateway.changePassword(changePasswordInput).subscribe({
      next: () => {
        changePasswordFlow.markSuccess();
        this._notifier.success('Change password', 'Password changed successfully');
      },
      error: ({ message }: ApplicationError) => {
        changePasswordFlow.markError();
        this._notifier.error('Failed to change password', message);
      },
    });
  }

  // Ответ пишется прямо в состояние, а не через updateCurrentUser: тот бросает
  // без признанной сессии, и catchError спрятал бы исключение под ошибку
  // загрузки профиля.
  refreshCurrentUser(): Observable<CurrentUser> {
    return this._authGateway.currentSession().pipe(
      filter(
        (result): result is AuthenticatedSession =>
          result.status === CurrentSessionStatus.Authenticated,
      ),
      tap((result) => {
        this._state.set(result);
      }),
      map(({ user }) => user),
      catchError(({ message }: ApplicationError) => {
        this._notifier.error('Failed to load profile', message);

        return EMPTY;
      }),
    );
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

  expireCurrentSession(): void {
    this._markAnonymous();
  }

  private _markAnonymous(): void {
    this._state.set({ status: CurrentSessionStatus.Anonymous });
  }
}

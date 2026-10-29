import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';

import { AUTH_GATEWAY, CurrentSessionResult } from './auth-gateway';
import { CurrentSessionStatus } from './current-session-status';
import { CurrentUser } from './current-user';

type CurrentSessionState =
  | { status: CurrentSessionStatus.Unknown }
  | { status: CurrentSessionStatus.Loading }
  | CurrentSessionResult;

@Injectable({
  providedIn: 'root',
})
export class CurrentSessionService {
  private readonly _authGateway = inject(AUTH_GATEWAY);

  private readonly _state = signal<CurrentSessionState>({ status: CurrentSessionStatus.Unknown });

  readonly status = computed(() => this._state().status);

  readonly currentUser = computed(() => {
    const state = this._state();

    return state.status === CurrentSessionStatus.Authenticated ? state.user : null;
  });

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

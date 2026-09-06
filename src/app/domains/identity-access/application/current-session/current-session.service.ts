import { inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';

import { AUTH_GATEWAY } from '../auth.gateway';

import { CurrentSessionResult } from './current-session-result.type';
import { CurrentSessionStatus } from './current-session-status.type';
import { CurrentUser } from './current-user.type';

import { Nullable } from '@shared/types';

@Injectable({
  providedIn: 'root',
})
export class CurrentSessionService {
  private readonly _authGateway = inject(AUTH_GATEWAY);

  private readonly _status = signal<CurrentSessionStatus>(CurrentSessionStatus.Unknown);
  readonly status = this._status.asReadonly();

  private readonly _currentUser = signal<Nullable<CurrentUser>>(null);
  readonly currentUser = this._currentUser.asReadonly();

  restoreCurrentSession(): Observable<CurrentSessionResult> {
    this._status.set(CurrentSessionStatus.Loading);

    return this._authGateway.currentSession().pipe(
      tap((result) => {
        if (result.status === CurrentSessionStatus.Authenticated) {
          this._currentUser.set(result.user);
          this._status.set(result.status);
        }

        if (result.status === CurrentSessionStatus.Anonymous) {
          this._markAnonymous();
        }
      }),
      catchError((error) => {
        this._markAnonymous();
        return throwError(() => error);
      }),
    );
  }

  updateCurrentUser(currentUser: CurrentUser): void {
    this._currentUser.set(currentUser);
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
    this._currentUser.set(null);
    this._status.set(CurrentSessionStatus.Anonymous);
  }
}

import { inject, Injectable, signal } from '@angular/core';

import { AUTH_GATEWAY } from '../auth.gateway';

import { CurrentSessionStatus } from './current-session-status';
import { CurrentUser } from './current-user';

import { Nullable } from '@app/shared/types';

@Injectable({
  providedIn: 'root',
})
export class CurrentSessionService {
  private readonly _authGateway = inject(AUTH_GATEWAY);

  private readonly _status = signal<CurrentSessionStatus>(CurrentSessionStatus.Unknown);
  readonly status = this._status.asReadonly();

  private readonly _currentUser = signal<Nullable<CurrentUser>>(null);
  readonly currentUser = this._currentUser.asReadonly();

  restoreCurrentSession(): void {
    this._status.set(CurrentSessionStatus.Loading);

    this._authGateway.currentSession().subscribe({
      next: (result) => {
        if (result.status === CurrentSessionStatus.Authenticated) {
          this._currentUser.set(result.user);
          this._status.set(result.status);
        }

        if (result.status === CurrentSessionStatus.Anonymous) {
          this._markAnonymous();
        }
      },
      error: () => {
        this._markAnonymous();
      },
    });
  }

  logout(): void {
    this._authGateway.logout().subscribe({
      next: () => {
        this._markAnonymous();
      },
      error: () => {
        this._markAnonymous();
      },
    });
  }

  private _markAnonymous(): void {
    this._currentUser.set(null);
    this._status.set(CurrentSessionStatus.Anonymous);
  }
}

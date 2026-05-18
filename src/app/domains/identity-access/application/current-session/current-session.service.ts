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

  restoreCurrentSession() {
    throw new Error('Nor implemented');
  }

  logout() {
    throw new Error('Nor implemented');
  }
}

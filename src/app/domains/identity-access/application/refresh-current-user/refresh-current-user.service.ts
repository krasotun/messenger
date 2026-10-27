import { inject, Injectable } from '@angular/core';
import { catchError, EMPTY, filter, map, Observable, tap } from 'rxjs';

import { AUTH_GATEWAY } from '../auth.gateway';
import { CurrentSessionStatus } from '../current-session/current-session-status.type';
import { CurrentSessionService } from '../current-session/current-session.service';
import { CurrentUser } from '../current-session/current-user.type';

import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';

@Injectable({
  providedIn: 'root',
})
export class RefreshCurrentUserService {
  private readonly _authGateway = inject(AUTH_GATEWAY);
  private readonly _currentSessionService = inject(CurrentSessionService);
  private readonly _notifier = inject(NOTIFIER);

  refreshCurrentUser(): Observable<CurrentUser> {
    return this._authGateway.currentSession().pipe(
      filter(
        (currentSessionStatus) =>
          currentSessionStatus.status === CurrentSessionStatus.Authenticated,
      ),
      map(({ user }) => user),
      tap((user) => {
        this._currentSessionService.updateCurrentUser(user);
      }),
      catchError(({ message }: ApplicationError) => {
        this._notifier.error('Failed to load profile', message);

        return EMPTY;
      }),
    );
  }
}

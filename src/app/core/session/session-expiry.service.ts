import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { CurrentSessionService } from '@domains/identity-access';
import { NOTIFIER } from '@shared/notifications';

@Injectable({
  providedIn: 'root',
})
export class SessionExpiryService {
  private readonly _currentSessionService = inject(CurrentSessionService);
  private readonly _notifier = inject(NOTIFIER);
  private readonly _router = inject(Router);

  handle(): void {
    this._currentSessionService.expireCurrentSession();
    this._notifier.error('Session expired', 'Please sign in again.');
    this._router.navigateByUrl('/sign-in');
  }
}

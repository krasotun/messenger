import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { CurrentSessionStatus } from '@domains/identity-access/application/current-session/current-session-status';
import { CurrentSessionService } from '@domains/identity-access/application/current-session/current-session.service';

export const guestOnlyGuard: CanActivateFn = () => {
  const currentSessionService = inject(CurrentSessionService);
  const router = inject(Router);

  const status = currentSessionService.status();

  if (status === CurrentSessionStatus.Authenticated) {
    return router.parseUrl('/');
  }

  return true;
};

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { CurrentSessionStatus } from '@app/domains/identity-access/application/current-session/current-session-status';
import { CurrentSessionService } from '@app/domains/identity-access/application/current-session/current-session.service';

export const authenticatedOnlyGuard: CanActivateFn = () => {
  const currentSessionService = inject(CurrentSessionService);
  const router = inject(Router);

  const status = currentSessionService.status();

  if (status === CurrentSessionStatus.Authenticated) {
    return true;
  }

  return router.parseUrl('/sign-in');
};

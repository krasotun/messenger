import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { CurrentSessionService, CurrentSessionStatus } from '@domains/identity-access';

export const authenticatedOnlyGuard: CanActivateFn = () => {
  const currentSessionService = inject(CurrentSessionService);
  const router = inject(Router);

  const status = currentSessionService.status();

  if (status === CurrentSessionStatus.Authenticated) {
    return true;
  }

  return router.parseUrl('/sign-in');
};

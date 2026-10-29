import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { CurrentSessionStore, CurrentSessionStatus } from '@domains/users';

export const authenticatedOnlyGuard: CanActivateFn = () => {
  const currentSessionStore = inject(CurrentSessionStore);
  const router = inject(Router);

  const status = currentSessionStore.status();

  if (status === CurrentSessionStatus.Authenticated) {
    return true;
  }

  return router.parseUrl('/sign-in');
};

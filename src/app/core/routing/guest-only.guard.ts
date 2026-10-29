import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { CurrentSessionStore, CurrentSessionStatus } from '@domains/users';

export const guestOnlyGuard: CanActivateFn = () => {
  const currentSessionStore = inject(CurrentSessionStore);
  const router = inject(Router);

  const status = currentSessionStore.status();

  if (status === CurrentSessionStatus.Authenticated) {
    return router.parseUrl('/');
  }

  return true;
};

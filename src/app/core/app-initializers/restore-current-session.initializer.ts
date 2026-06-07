import { inject, provideAppInitializer } from '@angular/core';

import { CurrentSessionService } from '@domains/identity-access';

export const provideCurrentSessionRestore = () => {
  return provideAppInitializer(() => {
    const currentSession = inject(CurrentSessionService);

    return currentSession.restoreCurrentSession();
  });
};

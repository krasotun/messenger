import { inject, provideAppInitializer } from '@angular/core';

import { CurrentSessionService } from '@app/domains/identity-access/application/current-session/current-session.service';

export const provideCurrentSessionRestore = () => {
  return provideAppInitializer(() => {
    const currentSession = inject(CurrentSessionService);

    return currentSession.restoreCurrentSession();
  });
};

import { HttpErrorResponse } from '@angular/common/http';

import { ApplicationError } from '@app/shared/errors';

export const mapAuthError = (error: unknown, fallbackMessage: string): ApplicationError => {
  return new ApplicationError(
    error instanceof HttpErrorResponse && error.error?.reason
      ? error.error.reason
      : fallbackMessage,
    error,
  );
};

import { HttpErrorResponse } from '@angular/common/http';

import { ApplicationError } from './application.error';

const parseErrorBody = (errorBody: string): { reason?: string } | undefined => {
  try {
    return JSON.parse(errorBody);
  } catch {
    return undefined;
  }
};

const getReason = (error: unknown): string | undefined => {
  if (!(error instanceof HttpErrorResponse)) {
    return undefined;
  }

  // При responseType: 'text' тело ошибки приходит строкой и не разбирается
  // HttpClient, поэтому reason достается из нее вручную.
  const errorBody = typeof error.error === 'string' ? parseErrorBody(error.error) : error.error;

  return errorBody?.reason;
};

export const mapHttpError = (error: unknown, fallbackMessage: string): ApplicationError => {
  return new ApplicationError(getReason(error) ?? fallbackMessage, error);
};

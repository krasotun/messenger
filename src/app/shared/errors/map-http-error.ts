import { HttpErrorResponse } from '@angular/common/http';

import { ApplicationError } from './application.error';

export const REQUEST_TIMED_OUT_MESSAGE = 'The request took too long. Please try again.';

const parseErrorBody = (errorBody: string): { reason?: string } | undefined => {
  try {
    return JSON.parse(errorBody);
  } catch {
    return undefined;
  }
};

// Истекший предел времени Angular отдает обычным HttpErrorResponse, положив в
// error DOMException с этим именем. Ошибка приходит без reason, поэтому без
// отдельной ветки она стала бы запасным сообщением вызывающей стороны.
const isTimeout = (error: unknown): boolean => {
  return error instanceof HttpErrorResponse && error.error?.name === 'TimeoutError';
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
  if (isTimeout(error)) {
    return new ApplicationError(REQUEST_TIMED_OUT_MESSAGE, error);
  }

  return new ApplicationError(getReason(error) ?? fallbackMessage, error);
};

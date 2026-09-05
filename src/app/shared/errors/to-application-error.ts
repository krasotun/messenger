import { catchError, OperatorFunction, throwError } from 'rxjs';

import { mapHttpError } from './map-http-error';

export const toApplicationError = <T>(fallbackMessage: string): OperatorFunction<T, T> => {
  return catchError((error) => throwError(() => mapHttpError(error, fallbackMessage)));
};

import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { ApplicationError } from './application.error';
import { REQUEST_TIMED_OUT_MESSAGE } from './map-http-error';
import { toApplicationError } from './to-application-error';

describe('toApplicationError', () => {
  it('should pass a successful value through unchanged', () => {
    const values: unknown[] = [];

    of('mockValue')
      .pipe(toApplicationError('fallbackMessage'))
      .subscribe((value) => values.push(value));

    expect(values).toEqual(['mockValue']);
  });

  it('should throw ApplicationError with backend reason', () => {
    const mockHttpError = new HttpErrorResponse({ error: { reason: 'mockReason' } });

    const errors: ApplicationError[] = [];

    throwError(() => mockHttpError)
      .pipe(toApplicationError('fallbackMessage'))
      .subscribe({
        error: (error: ApplicationError) => errors.push(error),
      });

    expect(errors).toHaveLength(1);
    expect(errors[0]).toBeInstanceOf(ApplicationError);
    expect(errors[0].message).toBe('mockReason');
  });

  it('should throw ApplicationError with the fallback message when reason is missing', () => {
    const mockHttpError = new HttpErrorResponse({ error: 'Internal Server Error' });

    const errors: ApplicationError[] = [];

    throwError(() => mockHttpError)
      .pipe(toApplicationError('fallbackMessage'))
      .subscribe({
        error: (error: ApplicationError) => errors.push(error),
      });

    expect(errors).toHaveLength(1);
    expect(errors[0]).toBeInstanceOf(ApplicationError);
    expect(errors[0].message).toBe('fallbackMessage');
  });

  it('should throw ApplicationError with a timeout message when the request timed out', () => {
    const mockHttpError = new HttpErrorResponse({
      error: new DOMException('Request timed out', 'TimeoutError'),
      status: 0,
      statusText: 'Request timeout',
    });

    const errors: ApplicationError[] = [];

    throwError(() => mockHttpError)
      .pipe(toApplicationError('fallbackMessage'))
      .subscribe({
        error: (error: ApplicationError) => errors.push(error),
      });

    expect(errors).toHaveLength(1);
    expect(errors[0]).toBeInstanceOf(ApplicationError);
    expect(errors[0].message).toBe(REQUEST_TIMED_OUT_MESSAGE);
  });
});

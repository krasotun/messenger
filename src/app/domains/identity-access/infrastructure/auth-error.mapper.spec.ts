import { HttpErrorResponse } from '@angular/common/http';

import { mapAuthError } from './auth-error.mapper';

import { ApplicationError } from '@shared/errors';

describe('mapAuthError', () => {
  it('should return ApplicationError with backend reason', () => {
    const mockHttpError = new HttpErrorResponse({ error: { reason: 'mockReason' } });

    const applicationError = mapAuthError(mockHttpError, 'fallbackMessage');

    expect(applicationError).toBeInstanceOf(ApplicationError);
    expect(applicationError.message).toBe('mockReason');
  });

  it('should return ApplicationError with reason from a text response body', () => {
    const mockHttpError = new HttpErrorResponse({
      error: JSON.stringify({ reason: 'mockReason' }),
    });

    const applicationError = mapAuthError(mockHttpError, 'fallbackMessage');

    expect(applicationError).toBeInstanceOf(ApplicationError);
    expect(applicationError.message).toBe('mockReason');
  });

  it('should return ApplicationError with fallback message when a text body is not json', () => {
    const mockHttpError = new HttpErrorResponse({ error: 'Internal Server Error' });

    const applicationError = mapAuthError(mockHttpError, 'fallbackMessage');

    expect(applicationError).toBeInstanceOf(ApplicationError);
    expect(applicationError.message).toBe('fallbackMessage');
  });

  it('should return ApplicationError with fallback message when a text body has no reason', () => {
    const mockHttpError = new HttpErrorResponse({ error: JSON.stringify({ other: 'value' }) });

    const applicationError = mapAuthError(mockHttpError, 'fallbackMessage');

    expect(applicationError).toBeInstanceOf(ApplicationError);
    expect(applicationError.message).toBe('fallbackMessage');
  });

  it('should return ApplicationError with fallback message when reason is missing', () => {
    const mockError = 'mockError';

    const applicationError = mapAuthError(mockError, 'fallbackMessage');

    expect(applicationError).toBeInstanceOf(ApplicationError);
    expect(applicationError.message).toBe('fallbackMessage');
  });
});

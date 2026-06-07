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

  it('should return ApplicationError with fallback message when reason is missing', () => {
    const mockError = 'mockError';

    const applicationError = mapAuthError(mockError, 'fallbackMessage');

    expect(applicationError).toBeInstanceOf(ApplicationError);
    expect(applicationError.message).toBe('fallbackMessage');
  });
});

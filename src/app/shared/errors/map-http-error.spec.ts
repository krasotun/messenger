import { HttpErrorResponse } from '@angular/common/http';

import { ApplicationError } from './application.error';
import { mapHttpError } from './map-http-error';

describe('mapHttpError', () => {
  it('should return ApplicationError with backend reason', () => {
    const mockHttpError = new HttpErrorResponse({ error: { reason: 'mockReason' } });

    const applicationError = mapHttpError(mockHttpError, 'fallbackMessage');

    expect(applicationError).toBeInstanceOf(ApplicationError);
    expect(applicationError.message).toBe('mockReason');
  });

  it('should return ApplicationError with reason from a text response body', () => {
    const mockHttpError = new HttpErrorResponse({
      error: JSON.stringify({ reason: 'mockReason' }),
    });

    const applicationError = mapHttpError(mockHttpError, 'fallbackMessage');

    expect(applicationError).toBeInstanceOf(ApplicationError);
    expect(applicationError.message).toBe('mockReason');
  });

  it('should return ApplicationError with fallback message when a text body is not json', () => {
    const mockHttpError = new HttpErrorResponse({ error: 'Internal Server Error' });

    const applicationError = mapHttpError(mockHttpError, 'fallbackMessage');

    expect(applicationError).toBeInstanceOf(ApplicationError);
    expect(applicationError.message).toBe('fallbackMessage');
  });

  it('should return ApplicationError with fallback message when a text body has no reason', () => {
    const mockHttpError = new HttpErrorResponse({ error: JSON.stringify({ other: 'value' }) });

    const applicationError = mapHttpError(mockHttpError, 'fallbackMessage');

    expect(applicationError).toBeInstanceOf(ApplicationError);
    expect(applicationError.message).toBe('fallbackMessage');
  });

  it('should return ApplicationError with fallback message when reason is missing', () => {
    const mockError = 'mockError';

    const applicationError = mapHttpError(mockError, 'fallbackMessage');

    expect(applicationError).toBeInstanceOf(ApplicationError);
    expect(applicationError.message).toBe('fallbackMessage');
  });
});

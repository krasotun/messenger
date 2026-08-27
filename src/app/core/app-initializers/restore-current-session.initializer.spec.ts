import { ApplicationInitStatus, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { defer, of, throwError } from 'rxjs';

import { provideCurrentSessionRestore } from './restore-current-session.initializer';

import { CurrentSessionService, CurrentSessionStatus } from '@domains/identity-access';

const statusMock = signal<CurrentSessionStatus>(CurrentSessionStatus.Unknown);

const currentSessionServiceMock = {
  restoreCurrentSession: vi.fn(),
  status: statusMock,
};

describe('provideCurrentSessionRestore', () => {
  beforeEach(() => {
    currentSessionServiceMock.restoreCurrentSession.mockReset();
    statusMock.set(CurrentSessionStatus.Unknown);

    TestBed.configureTestingModule({
      providers: [
        provideCurrentSessionRestore(),
        {
          provide: CurrentSessionService,
          useValue: currentSessionServiceMock,
        },
      ],
    });
  });

  it('calls restoreCurrentSession during app initialization', async () => {
    currentSessionServiceMock.restoreCurrentSession.mockReturnValue(
      of({ status: CurrentSessionStatus.Anonymous }),
    );

    const appInitStatus = TestBed.inject(ApplicationInitStatus);

    await appInitStatus.donePromise;

    expect(currentSessionServiceMock.restoreCurrentSession).toHaveBeenCalledTimes(1);
  });

  it('finishes app initialization when restoring the session fails', async () => {
    currentSessionServiceMock.restoreCurrentSession.mockReturnValue(
      throwError(() => new Error('backend is down')),
    );

    const appInitStatus = TestBed.inject(ApplicationInitStatus);

    await expect(appInitStatus.donePromise).resolves.not.toThrow();
  });

  it('keeps the status the session service has set when restoring fails', async () => {
    currentSessionServiceMock.restoreCurrentSession.mockReturnValue(
      defer(() => {
        statusMock.set(CurrentSessionStatus.Anonymous);

        return throwError(() => new Error('backend is down'));
      }),
    );

    const appInitStatus = TestBed.inject(ApplicationInitStatus);

    await appInitStatus.donePromise;

    expect(currentSessionServiceMock.status()).toBe(CurrentSessionStatus.Anonymous);
  });
});

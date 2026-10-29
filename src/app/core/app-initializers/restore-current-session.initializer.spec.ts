import { ApplicationInitStatus, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { defer, of, throwError } from 'rxjs';

import { provideCurrentSessionRestore } from './restore-current-session.initializer';

import { CurrentSessionStore, CurrentSessionStatus } from '@domains/users';

const statusMock = signal<CurrentSessionStatus>(CurrentSessionStatus.Unknown);

const currentSessionStoreMock = {
  restoreCurrentSession: vi.fn(),
  status: statusMock,
};

describe('provideCurrentSessionRestore', () => {
  beforeEach(() => {
    currentSessionStoreMock.restoreCurrentSession.mockReset();
    statusMock.set(CurrentSessionStatus.Unknown);

    TestBed.configureTestingModule({
      providers: [
        provideCurrentSessionRestore(),
        {
          provide: CurrentSessionStore,
          useValue: currentSessionStoreMock,
        },
      ],
    });
  });

  it('calls restoreCurrentSession during app initialization', async () => {
    currentSessionStoreMock.restoreCurrentSession.mockReturnValue(
      of({ status: CurrentSessionStatus.Anonymous }),
    );

    const appInitStatus = TestBed.inject(ApplicationInitStatus);

    await appInitStatus.donePromise;

    expect(currentSessionStoreMock.restoreCurrentSession).toHaveBeenCalledTimes(1);
  });

  it('finishes app initialization when restoring the session fails', async () => {
    currentSessionStoreMock.restoreCurrentSession.mockReturnValue(
      throwError(() => new Error('backend is down')),
    );

    const appInitStatus = TestBed.inject(ApplicationInitStatus);

    await expect(appInitStatus.donePromise).resolves.not.toThrow();
  });

  it('keeps the status the session store has set when restoring fails', async () => {
    currentSessionStoreMock.restoreCurrentSession.mockReturnValue(
      defer(() => {
        statusMock.set(CurrentSessionStatus.Anonymous);

        return throwError(() => new Error('backend is down'));
      }),
    );

    const appInitStatus = TestBed.inject(ApplicationInitStatus);

    await appInitStatus.donePromise;

    expect(currentSessionStoreMock.status()).toBe(CurrentSessionStatus.Anonymous);
  });
});

import { ApplicationInitStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { provideCurrentSessionRestore } from './restore-current-session.initializer';

import { CurrentSessionService, CurrentSessionStatus } from '@domains/identity-access';

const currentSessionServiceMock = {
  restoreCurrentSession: vi.fn(),
};

describe('provideCurrentSessionRestore', () => {
  beforeEach(() => {
    currentSessionServiceMock.restoreCurrentSession.mockReset();

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
});

import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  provideRouter,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

import { authenticatedOnlyGuard } from './authenticated-only.guard';

import { CurrentSessionStatus } from '@app/domains/identity-access/application/current-session/current-session-status';
import { CurrentSessionService } from '@app/domains/identity-access/application/current-session/current-session.service';

const currentSessionServiceMock = {
  status: vi.fn(),
};

describe('authenticatedOnlyGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authenticatedOnlyGuard(...guardParameters));

  beforeEach(() => {
    currentSessionServiceMock.status.mockReset();

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: CurrentSessionService,
          useValue: currentSessionServiceMock,
        },
      ],
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  describe('authenticated', () => {
    it('should allow authenticated users', () => {
      currentSessionServiceMock.status.mockReturnValue(CurrentSessionStatus.Authenticated);

      const result = executeGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);

      expect(result).toBe(true);
    });
  });

  describe('anonymous', () => {
    it('should redirect anonymous users to sign-in page', () => {
      const router = TestBed.inject(Router);
      const expectedRedirect = router.parseUrl('/sign-in');

      currentSessionServiceMock.status.mockReturnValue(CurrentSessionStatus.Anonymous);

      const result = executeGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);

      expect(result).toEqual(expectedRedirect);
    });

    it('should redirect unknown session status to sign-in page', () => {
      const router = TestBed.inject(Router);
      const expectedRedirect = router.parseUrl('/sign-in');

      currentSessionServiceMock.status.mockReturnValue(CurrentSessionStatus.Unknown);

      const result = executeGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);

      expect(result).toEqual(expectedRedirect);
    });
  });
});

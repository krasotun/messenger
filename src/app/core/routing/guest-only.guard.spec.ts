import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  provideRouter,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

import { guestOnlyGuard } from './guest-only.guard';

import { CurrentSessionService, CurrentSessionStatus } from '@domains/identity-access';

const currentSessionServiceMock = {
  status: vi.fn(),
};

describe('guestOnlyGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => guestOnlyGuard(...guardParameters));

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
    it('should redirect authenticated users to main page', () => {
      const router = TestBed.inject(Router);
      const expectedRedirect = router.parseUrl('/');

      currentSessionServiceMock.status.mockReturnValue(CurrentSessionStatus.Authenticated);

      const result = executeGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);

      expect(result).toEqual(expectedRedirect);
    });
  });

  describe('anonymous', () => {
    it('should allow anonymous users', () => {
      currentSessionServiceMock.status.mockReturnValue(CurrentSessionStatus.Anonymous);

      const result = executeGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);

      expect(result).toBe(true);
    });
  });
});

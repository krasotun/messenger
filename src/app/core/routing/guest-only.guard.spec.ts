import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  provideRouter,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

import { guestOnlyGuard } from './guest-only.guard';

import { CurrentSessionStore, CurrentSessionStatus } from '@domains/users';

const currentSessionStoreMock = {
  status: vi.fn(),
};

describe('guestOnlyGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => guestOnlyGuard(...guardParameters));

  beforeEach(() => {
    currentSessionStoreMock.status.mockReset();

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: CurrentSessionStore,
          useValue: currentSessionStoreMock,
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

      currentSessionStoreMock.status.mockReturnValue(CurrentSessionStatus.Authenticated);

      const result = executeGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);

      expect(result).toEqual(expectedRedirect);
    });
  });

  describe('anonymous', () => {
    it('should allow anonymous users', () => {
      currentSessionStoreMock.status.mockReturnValue(CurrentSessionStatus.Anonymous);

      const result = executeGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);

      expect(result).toBe(true);
    });
  });
});

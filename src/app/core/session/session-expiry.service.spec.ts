import { ApplicationRef, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { SessionExpiryService } from './session-expiry.service';

import { CurrentSessionService, CurrentSessionStatus } from '@domains/identity-access';
import { AUTH_GATEWAY, IdentityMocks } from '@domains/identity-access/testing';
import { NOTIFIER } from '@shared/notifications';
import { NotificationMocks } from '@shared/notifications/testing';

@Component({
  selector: 'app-sign-in-page',
  template: '',
})
class SignInPageStub {}

describe('SessionExpiryService', () => {
  let service: SessionExpiryService;

  let currentSessionService: CurrentSessionService;

  let authGatewayMock: ReturnType<typeof IdentityMocks.authGateway>;
  let notifierMock: ReturnType<typeof NotificationMocks.notifier>;
  let router: Router;

  beforeEach(() => {
    authGatewayMock = IdentityMocks.authGateway();
    notifierMock = NotificationMocks.notifier();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AUTH_GATEWAY,
          useValue: authGatewayMock,
        },
        {
          provide: NOTIFIER,
          useValue: notifierMock,
        },
        provideRouter([{ path: 'sign-in', component: SignInPageStub }]),
      ],
    });

    service = TestBed.inject(SessionExpiryService);
    currentSessionService = TestBed.inject(CurrentSessionService);

    router = TestBed.inject(Router);
  });

  describe('handle', () => {
    it('should expire current session', () => {
      service.handle();

      expect(currentSessionService.status()).toBe(CurrentSessionStatus.Anonymous);
    });

    it('should show error notification', () => {
      service.handle();

      expect(notifierMock.error).toHaveBeenCalledWith('Session expired', 'Please sign in again.');
    });

    it('should navigate to sign-in page', async () => {
      service.handle();

      await TestBed.inject(ApplicationRef).whenStable();

      expect(router.url).toBe('/sign-in');
    });
  });
});

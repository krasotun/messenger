import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NEVER, of } from 'rxjs';

import { sessionExpiryInterceptor } from './session-expiry.interceptor';

import { CurrentSessionStore, CurrentSessionStatus, USER_GATEWAY } from '@domains/users';
import { AUTH_GATEWAY, UserMocks } from '@domains/users/testing';
import { NOTIFIER } from '@shared/notifications';
import { NotificationMocks } from '@shared/notifications/testing';

@Component({
  selector: 'app-sign-in-page',
  template: '',
})
class SignInPageStub {}

describe('sessionExpiryInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  let currentSessionStore: CurrentSessionStore;
  let authGatewayMock: ReturnType<typeof UserMocks.authGateway>;
  let notifierMock: ReturnType<typeof NotificationMocks.notifier>;

  beforeEach(() => {
    authGatewayMock = UserMocks.authGateway();
    notifierMock = NotificationMocks.notifier();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([sessionExpiryInterceptor])),
        provideHttpClientTesting(),
        {
          provide: AUTH_GATEWAY,
          useValue: authGatewayMock,
        },
        {
          provide: USER_GATEWAY,
          useValue: UserMocks.userGateway(),
        },
        {
          provide: NOTIFIER,
          useValue: notifierMock,
        },
        provideRouter([{ path: 'sign-in', component: SignInPageStub }]),
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    currentSessionStore = TestBed.inject(CurrentSessionStore);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  describe('Authenticated status', () => {
    beforeEach(() => {
      authGatewayMock.currentSession.mockReturnValue(of(UserMocks.authenticatedSession()));
      currentSessionStore.restoreCurrentSession().subscribe();
    });

    it('should expire current session on 401 error', () => {
      httpClient.post('/mock/test', {}).subscribe({ error: () => undefined });

      httpTestingController
        .expectOne('/mock/test')
        .flush({ reason: 'Cookie is not valid' }, { status: 401, statusText: 'Unauthorized' });

      expect(currentSessionStore.status()).toBe(CurrentSessionStatus.Anonymous);
    });

    it('should not expire current session on not 401 error', () => {
      httpClient.post('/mock/test', {}).subscribe({ error: () => undefined });

      httpTestingController
        .expectOne('/mock/test')
        .flush({ reason: 'Server error' }, { status: 500, statusText: 'Unknown error' });

      expect(currentSessionStore.status()).toBe(CurrentSessionStatus.Authenticated);
    });

    it('should pass the 401 error to the caller', () => {
      let received: unknown;
      httpClient.post('/mock/test', {}).subscribe({ error: (err) => (received = err) });

      httpTestingController
        .expectOne('/mock/test')
        .flush({ reason: 'Cookie is not valid' }, { status: 401, statusText: 'Unauthorized' });

      expect(received).toMatchObject({ status: 401, error: { reason: 'Cookie is not valid' } });
      expect(received).toBeInstanceOf(HttpErrorResponse);
    });
  });

  describe('Anonymous status', () => {
    it('should not expire current session on 401 error', () => {
      authGatewayMock.currentSession.mockReturnValue(of(UserMocks.anonymousSession()));
      currentSessionStore.restoreCurrentSession().subscribe();
      httpClient.post('/mock/test', {}).subscribe({ error: () => undefined });

      httpTestingController
        .expectOne('/mock/test')
        .flush({ reason: 'Cookie is not valid' }, { status: 401, statusText: 'Unauthorized' });

      expect(notifierMock.error).not.toHaveBeenCalled();
    });
  });

  describe('Loading status', () => {
    it('should not expire current session on 401 error', () => {
      // Gateway не отвечает: сессия застревает в Loading, как при старте приложения.
      authGatewayMock.currentSession.mockReturnValue(NEVER);
      currentSessionStore.restoreCurrentSession().subscribe();

      httpClient.post('/mock/test', {}).subscribe({ error: () => undefined });

      httpTestingController
        .expectOne('/mock/test')
        .flush({ reason: 'Cookie is not valid' }, { status: 401, statusText: 'Unauthorized' });

      expect(notifierMock.error).not.toHaveBeenCalled();
    });
  });
});

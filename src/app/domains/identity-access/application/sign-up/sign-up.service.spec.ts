import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';

import { AUTH_GATEWAY } from '../auth.gateway';

import { SignUpInput } from './sign-up-input.type';
import { SignUpService } from './sign-up.service';

import { IdentityMocks } from '@domains/identity-access/testing';
import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
import { NotificationMocks } from '@shared/notifications/testing';

const signUpInputMock: SignUpInput = {
  firstName: 'mockFirstName',
  secondName: 'mockSecondName',
  login: 'mockLogin',
  email: 'mock@email.email',
  password: 'mockPassword',
  phone: '79999999999',
};

describe('SignUpService', () => {
  let authGatewayMock: ReturnType<typeof IdentityMocks.authGateway>;
  let notifierMock: ReturnType<typeof NotificationMocks.notifier>;
  let service: SignUpService;

  beforeEach(() => {
    authGatewayMock = IdentityMocks.authGateway();
    notifierMock = NotificationMocks.notifier();

    TestBed.configureTestingModule({
      providers: [
        SignUpService,

        {
          provide: AUTH_GATEWAY,
          useValue: authGatewayMock,
        },

        {
          provide: NOTIFIER,
          useValue: notifierMock,
        },
      ],
    });
    service = TestBed.inject(SignUpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('isSubmitting should be false', () => {
      expect(service.isSubmitting()).toBe(false);
    });
  });

  describe('signUp', () => {
    it('calls authGateway with form values', () => {
      authGatewayMock.signUp.mockReturnValue(of({ userId: 1 }));

      service.signUp(signUpInputMock);

      expect(authGatewayMock.signUp).toHaveBeenCalledWith(signUpInputMock);
    });

    it('should set submitting state while request is pending', () => {
      const signUpResult$ = new Subject<{ userId: number }>();
      authGatewayMock.signUp.mockReturnValueOnce(signUpResult$);

      service.signUp(signUpInputMock);

      expect(service.isSubmitting()).toBe(true);
    });

    it('should emit succeeded$ once when request succeeds', () => {
      const signUpResult$ = of({ userId: 1 });
      authGatewayMock.signUp.mockReturnValue(signUpResult$);
      const succeededSpy = vi.fn();
      service.succeeded$.subscribe(succeededSpy);

      service.signUp(signUpInputMock);

      expect(succeededSpy).toHaveBeenCalledOnce();
      expect(service.isSubmitting()).toBe(false);
      expect(notifierMock.error).not.toHaveBeenCalled();
    });

    it('should notify with the reason from the backend', () => {
      const signUpResult$ = throwError(() => {
        return new ApplicationError('mockReason');
      });
      authGatewayMock.signUp.mockReturnValue(signUpResult$);
      const succeededSpy = vi.fn();
      service.succeeded$.subscribe(succeededSpy);

      service.signUp(signUpInputMock);

      expect(succeededSpy).not.toHaveBeenCalled();
      expect(service.isSubmitting()).toBe(false);
      expect(notifierMock.error).toHaveBeenCalledWith('Sign-up failed', 'mockReason');
    });
  });
});

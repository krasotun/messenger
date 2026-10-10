import { TestBed } from '@angular/core/testing';
import { render, within } from '@testing-library/angular/zoneless';
import { userEvent } from '@testing-library/user-event';
import { throwError } from 'rxjs';

import { ChangePasswordService } from '../../application/change-password/change-password.service';
import { USER_GATEWAY } from '../../application/user.gateway';

import { ChangePasswordModalContent } from './change-password-modal-content';

import { IdentityMocks } from '@domains/identity-access/testing';
import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
import { NotificationMocks } from '@shared/notifications/testing';
import { ModalRef } from '@shared/ui/modal/modal-ref';
import { ModalMocks } from '@shared/ui/modal/testing';

const passwordLabels = ['Old password', 'New password', 'Repeat new password'];

describe('ChangePasswordModalContent', () => {
  let changePasswordServiceMock: ReturnType<typeof IdentityMocks.changePasswordService>;
  let modalRefMock: ReturnType<typeof ModalMocks.modalRef>;
  let notifierMock: ReturnType<typeof NotificationMocks.notifier>;

  const sharedProviders = () => [
    { provide: ModalRef, useValue: modalRefMock },
    { provide: NOTIFIER, useValue: notifierMock },
  ];

  // ChangePasswordService живет в providers компонента модалки.
  const renderModal = () =>
    render(ChangePasswordModalContent, {
      providers: sharedProviders(),
      configureTestBed: (testBed) =>
        testBed.overrideComponent(ChangePasswordModalContent, {
          set: {
            providers: [{ provide: ChangePasswordService, useValue: changePasswordServiceMock }],
          },
        }),
      waitForStableOnRender: true,
    });

  beforeEach(() => {
    changePasswordServiceMock = IdentityMocks.changePasswordService();
    modalRefMock = ModalMocks.modalRef();
    notifierMock = NotificationMocks.notifier();
  });

  it('should create', async () => {
    const { fixture } = await renderModal();

    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('successful change', () => {
    it('should close the modal without a manual application tick', async () => {
      await renderModal();

      changePasswordServiceMock.succeeded$.next();

      expect(modalRefMock.close).toHaveBeenCalledOnce();
    });
  });

  describe('closing without submitting', () => {
    it('should not call changePassword', async () => {
      await renderModal();

      expect(changePasswordServiceMock.changePassword).not.toHaveBeenCalled();
    });
  });

  describe('flow lifetime', () => {
    let userGatewayMock: ReturnType<typeof IdentityMocks.userGateway>;

    beforeEach(() => {
      userGatewayMock = IdentityMocks.userGateway();
      userGatewayMock.changePassword.mockImplementation(() =>
        throwError(() => new ApplicationError('Mock error')),
      );
    });

    // render настраивает TestBed и второй раз в одном тесте не вызывается:
    // повторное открытие модалки идет через TestBed.createComponent.
    it('should show an empty form without an error when reopened after a failed change', async () => {
      const user = userEvent.setup();
      const { fixture: failedFixture, container } = await render(ChangePasswordModalContent, {
        providers: [...sharedProviders(), { provide: USER_GATEWAY, useValue: userGatewayMock }],
        waitForStableOnRender: true,
      });
      const failedModal = within(container);

      await user.type(failedModal.getByLabelText('Old password'), 'typedOldPassword');
      await user.type(failedModal.getByLabelText('New password'), 'typedNewPassword');
      await user.type(failedModal.getByLabelText('Repeat new password'), 'typedNewPassword');
      await user.click(failedModal.getByRole('button', { name: 'Save' }));
      await failedFixture.whenStable();

      expect(notifierMock.error).toHaveBeenCalledWith('Failed to change password', 'Mock error');
      expect(container.querySelector('.change-password-form__error')).toBeNull();

      failedFixture.destroy();

      const reopenedFixture = TestBed.createComponent(ChangePasswordModalContent);
      await reopenedFixture.whenStable();
      const reopenedModal = within(reopenedFixture.nativeElement);

      for (const label of passwordLabels) {
        expect(reopenedModal.getByLabelText(label)).toHaveValue('');
      }

      expect(
        reopenedFixture.nativeElement.querySelector('.change-password-form__error'),
      ).toBeNull();
    });
  });
});

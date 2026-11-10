import { TestBed } from '@angular/core/testing';
import { render, within } from '@testing-library/angular/zoneless';
import { userEvent } from '@testing-library/user-event';
import { of, throwError } from 'rxjs';

import { AUTH_GATEWAY } from '../../data/auth-gateway';
import { USER_GATEWAY } from '../../data/user-gateway';

import { ChangePasswordModalContent } from './change-password-modal-content';

import { UserMocks } from '@domains/users/testing';
import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
import { NotificationMocks } from '@shared/notifications/testing';
import { ModalRef } from '@shared/ui/modal/modal-ref';
import { ModalMocks } from '@shared/ui/modal/testing';

const passwordLabels = ['Old password', 'New password', 'Repeat new password'];

describe('ChangePasswordModalContent', () => {
  let userGatewayMock: ReturnType<typeof UserMocks.userGateway>;
  let modalRefMock: ReturnType<typeof ModalMocks.modalRef>;
  let notifierMock: ReturnType<typeof NotificationMocks.notifier>;

  const sharedProviders = () => [
    { provide: AUTH_GATEWAY, useValue: UserMocks.authGateway() },
    { provide: USER_GATEWAY, useValue: userGatewayMock },
    { provide: ModalRef, useValue: modalRefMock },
    { provide: NOTIFIER, useValue: notifierMock },
  ];

  const renderModal = () =>
    render(ChangePasswordModalContent, {
      providers: sharedProviders(),
      waitForStableOnRender: true,
    });

  beforeEach(() => {
    userGatewayMock = UserMocks.userGateway();
    modalRefMock = ModalMocks.modalRef();
    notifierMock = NotificationMocks.notifier();
  });

  it('should create', async () => {
    const { fixture } = await renderModal();

    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('successful change', () => {
    it('should close the modal without a manual application tick', async () => {
      const user = userEvent.setup();
      userGatewayMock.changePassword.mockReturnValue(of({ passwordChanged: true }));
      const { container } = await renderModal();
      const modal = within(container);

      await user.type(modal.getByLabelText('Old password'), 'typedOldPassword');
      await user.type(modal.getByLabelText('New password'), 'typedNewPassword');
      await user.type(modal.getByLabelText('Repeat new password'), 'typedNewPassword');
      await user.click(modal.getByRole('button', { name: 'Save' }));

      expect(modalRefMock.close).toHaveBeenCalledOnce();
    });
  });

  describe('closing without submitting', () => {
    it('should not call changePassword', async () => {
      await renderModal();

      expect(userGatewayMock.changePassword).not.toHaveBeenCalled();
    });
  });

  describe('flow lifetime', () => {
    beforeEach(() => {
      userGatewayMock.changePassword.mockImplementation(() =>
        throwError(() => new ApplicationError('Mock error')),
      );
    });

    // render настраивает TestBed и второй раз в одном тесте не вызывается:
    // повторное открытие модалки идет через TestBed.createComponent.
    it('should show an empty form without an error when reopened after a failed change', async () => {
      const user = userEvent.setup();
      const { fixture: failedFixture, container } = await render(ChangePasswordModalContent, {
        providers: sharedProviders(),
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

import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { render, screen, waitFor, within } from '@testing-library/angular/zoneless';
import { userEvent, UserEvent } from '@testing-library/user-event';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { of, throwError } from 'rxjs';

import { AUTH_GATEWAY } from '../../data/auth-gateway';
import { USER_GATEWAY } from '../../data/user-gateway';

import { ChangePasswordModalContent } from './change-password-modal-content';

import { UserMocks } from '@domains/users/testing';
import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
import { NotificationMocks } from '@shared/notifications/testing';
import { DIALOG_DEFAULTS } from '@shared/ui/dialog/dialog-defaults.constants';

const passwordLabels = ['Old password', 'New password', 'Repeat new password'];

// Диалог кита вешается на body и живет вне фикстуры: хост нужен только затем,
// чтобы render поднял TestBed с провайдерами и убрал за собой.
@Component({
  selector: 'app-test-host',
  template: '',
})
class TestHost {}

describe('ChangePasswordModalContent', () => {
  let userGatewayMock: ReturnType<typeof UserMocks.userGateway>;
  let notifierMock: ReturnType<typeof NotificationMocks.notifier>;
  let user: UserEvent;

  // Открываем так же, как меню: настоящий DialogService.
  const openDialog = async (): Promise<DynamicDialogRef<ChangePasswordModalContent>> => {
    const dialogRef = TestBed.inject(DialogService).open(ChangePasswordModalContent, {
      ...DIALOG_DEFAULTS,
      header: 'Change password',
    });

    if (!dialogRef) {
      throw new Error('Dialog was not opened');
    }

    await screen.findByLabelText('Old password');

    return dialogRef;
  };

  const closeDialog = async (dialogRef: DynamicDialogRef): Promise<void> => {
    dialogRef.close();

    await waitFor(() => expect(screen.queryByLabelText('Old password')).not.toBeInTheDocument());
  };

  const renderModal = async (): Promise<DynamicDialogRef<ChangePasswordModalContent>> => {
    await render(TestHost, {
      providers: [
        DialogService,
        { provide: AUTH_GATEWAY, useValue: UserMocks.authGateway() },
        { provide: USER_GATEWAY, useValue: userGatewayMock },
        { provide: NOTIFIER, useValue: notifierMock },
      ],
      waitForStableOnRender: true,
    });

    return openDialog();
  };

  const fillAndSave = async (): Promise<void> => {
    const modal = within(screen.getByRole('dialog', { name: 'Change password' }));

    await user.type(modal.getByLabelText('Old password'), 'typedOldPassword');
    await user.type(modal.getByLabelText('New password'), 'typedNewPassword');
    await user.type(modal.getByLabelText('Repeat new password'), 'typedNewPassword');
    await user.click(modal.getByRole('button', { name: 'Save' }));
  };

  beforeEach(() => {
    user = userEvent.setup();
    userGatewayMock = UserMocks.userGateway();
    notifierMock = NotificationMocks.notifier();
  });

  describe('successful change', () => {
    it('should close the dialog', async () => {
      userGatewayMock.changePassword.mockReturnValue(of({ passwordChanged: true }));
      await renderModal();

      await fillAndSave();

      await waitFor(() => expect(screen.queryByLabelText('Old password')).not.toBeInTheDocument());
    });
  });

  describe('opening without submitting', () => {
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

    it('should show an empty form without an error when reopened after a failed change', async () => {
      const failedDialogRef = await renderModal();

      await fillAndSave();

      expect(notifierMock.error).toHaveBeenCalledWith('Failed to change password', 'Mock error');
      expect(document.body.querySelector('.change-password-form__error')).toBeNull();

      await closeDialog(failedDialogRef);
      await openDialog();

      for (const label of passwordLabels) {
        expect(screen.getByLabelText(label)).toHaveValue('');
      }

      expect(document.body.querySelector('.change-password-form__error')).toBeNull();
    });
  });
});

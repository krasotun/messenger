import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/angular/zoneless';
import { userEvent, UserEvent } from '@testing-library/user-event';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { of, Subject, throwError } from 'rxjs';

import { AUTH_GATEWAY } from '../../data/auth-gateway';
import { CurrentSessionStatus } from '../../data/current-session-status';
import { CurrentSessionStore } from '../../data/current-session-store';
import { CurrentUser } from '../../data/current-user';
import { ChangeAvatarResult, USER_GATEWAY } from '../../data/user-gateway';

import { UpdateProfileModalContent } from './update-profile-modal-content';

import { UserMocks } from '@domains/users/testing';
import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
import { NotificationMocks } from '@shared/notifications/testing';
import { DIALOG_DEFAULTS } from '@shared/ui/dialog/dialog-defaults.constants';

const currentUserMock = UserMocks.currentUser({
  firstName: 'firstName',
  secondName: 'secondName',
  displayName: 'displayName',
  login: 'login',
  email: 'email@mock.ru',
  phone: '+79991234567',
});

const pngFileMock = new File(['mockContent'], 'avatar.png', { type: 'image/png' });

const changeAvatarError = /^Avatar change failed:/;

// Диалог кита вешается на body и живет вне фикстуры: хост нужен только затем,
// чтобы render поднял TestBed с провайдерами и убрал за собой.
@Component({
  selector: 'app-test-host',
  template: '',
})
class TestHost {}

describe('UpdateProfileModalContent', () => {
  let userGatewayMock: ReturnType<typeof UserMocks.userGateway>;
  let authGatewayMock: ReturnType<typeof UserMocks.authGateway>;
  let notifierMock: ReturnType<typeof NotificationMocks.notifier>;
  let user: UserEvent;

  const sharedProviders = () => [
    DialogService,
    { provide: NOTIFIER, useValue: notifierMock },
    { provide: USER_GATEWAY, useValue: userGatewayMock },
    { provide: AUTH_GATEWAY, useValue: authGatewayMock },
  ];

  // Открываем так же, как меню: настоящий DialogService, пользователь - во входе.
  const openDialog = async (
    currentUser: CurrentUser = currentUserMock,
  ): Promise<DynamicDialogRef<UpdateProfileModalContent>> => {
    const dialogRef = TestBed.inject(DialogService).open(UpdateProfileModalContent, {
      ...DIALOG_DEFAULTS,
      header: 'Edit profile',
      inputValues: { currentUser },
    });

    if (!dialogRef) {
      throw new Error('Dialog was not opened');
    }

    await screen.findByLabelText('First name');

    return dialogRef;
  };

  const closeDialog = async (dialogRef: DynamicDialogRef): Promise<void> => {
    dialogRef.close();

    await waitFor(() => expect(screen.queryByLabelText('First name')).not.toBeInTheDocument());
  };

  // Смена аватара и Редактирование профиля идут через настоящий
  // CurrentSessionStore с восстановленной сессией.
  const renderModal = async (
    currentUser: CurrentUser = currentUserMock,
  ): Promise<DynamicDialogRef<UpdateProfileModalContent>> => {
    await render(TestHost, {
      providers: sharedProviders(),
      configureTestBed: (testBed) => {
        testBed.inject(CurrentSessionStore).restoreCurrentSession().subscribe();
      },
      waitForStableOnRender: true,
    });

    return openDialog(currentUser);
  };

  const selectAvatarFile = async (modal: HTMLElement = document.body): Promise<void> => {
    await user.upload(within(modal).getByLabelText(/Choose file/), pngFileMock);
  };

  const submitChangeAvatarForm = async (modal: HTMLElement = document.body): Promise<void> => {
    await user.click(within(modal).getByRole('button', { name: 'Change avatar' }));
  };

  const changeFirstNameAndSave = async (modal: HTMLElement = document.body): Promise<void> => {
    await user.type(within(modal).getByLabelText('First name'), ' changed');
    await user.click(within(modal).getByRole('button', { name: 'Save' }));
  };

  beforeEach(() => {
    user = userEvent.setup();
    userGatewayMock = UserMocks.userGateway();
    authGatewayMock = UserMocks.authGateway();
    authGatewayMock.currentSession.mockImplementation(() =>
      of({ status: CurrentSessionStatus.Authenticated, user: currentUserMock }),
    );
    notifierMock = NotificationMocks.notifier();
  });

  describe('profile mapping', () => {
    it('should fill the form with the current user from the input', async () => {
      await renderModal();

      expect(screen.getByLabelText('First name')).toHaveValue(currentUserMock.firstName);
      expect(screen.getByLabelText('Second name')).toHaveValue(currentUserMock.secondName);
      expect(screen.getByLabelText('Display name')).toHaveValue(currentUserMock.displayName);
      expect(screen.getByLabelText('Login')).toHaveValue(currentUserMock.login);
      expect(screen.getByLabelText('Email')).toHaveValue(currentUserMock.email);
      expect(screen.getByLabelText('Mobile phone')).toHaveValue(currentUserMock.phone);
    });

    it('should fill the display name with an empty string when the current user has none', async () => {
      await renderModal({ ...currentUserMock, displayName: null });

      expect(screen.getByLabelText('Display name')).toHaveValue('');
    });
  });

  describe('successful save', () => {
    it('should close the dialog', async () => {
      userGatewayMock.updateProfile.mockReturnValue(of({ user: currentUserMock }));
      await renderModal();

      await changeFirstNameAndSave();

      await waitFor(() => expect(screen.queryByLabelText('First name')).not.toBeInTheDocument());
    });
  });

  describe('closing without saving', () => {
    it('should not call updateProfile', async () => {
      await renderModal();

      expect(userGatewayMock.updateProfile).not.toHaveBeenCalled();
    });

    it('should not call changeAvatar even when a file has been selected', async () => {
      const dialogRef = await renderModal();

      await selectAvatarFile();

      await closeDialog(dialogRef);

      expect(userGatewayMock.changeAvatar).not.toHaveBeenCalled();
    });
  });

  describe('both forms', () => {
    it('should be shown together', async () => {
      await renderModal();

      expect(screen.getByRole('button', { name: 'Change avatar' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });

    it('should keep the change avatar submit out of the update profile use case', async () => {
      userGatewayMock.changeAvatar.mockReturnValue(new Subject<ChangeAvatarResult>());
      await renderModal();

      await selectAvatarFile();
      await submitChangeAvatarForm();

      expect(userGatewayMock.changeAvatar).toHaveBeenCalledOnce();
      expect(userGatewayMock.updateProfile).not.toHaveBeenCalled();
      expect(screen.getByLabelText('First name')).toBeInTheDocument();
    });

    it('should keep the update profile submit out of the change avatar use case', async () => {
      userGatewayMock.updateProfile.mockReturnValue(of({ user: currentUserMock }));
      await renderModal();

      await changeFirstNameAndSave();

      expect(userGatewayMock.updateProfile).toHaveBeenCalledOnce();
      expect(userGatewayMock.changeAvatar).not.toHaveBeenCalled();
    });
  });

  describe('flow lifetime', () => {
    beforeEach(() => {
      userGatewayMock.updateProfile.mockImplementation(() =>
        throwError(() => new ApplicationError('Mock error')),
      );
      userGatewayMock.changeAvatar.mockImplementation(() =>
        throwError(() => new ApplicationError('Mock error')),
      );
    });

    it('should show a form without an error when reopened after a failed save', async () => {
      const failedDialogRef = await renderModal();

      await changeFirstNameAndSave();

      expect(notifierMock.error).toHaveBeenCalledWith('Failed to update profile', 'Mock error');
      expect(document.body.querySelector('.update-profile-form__error')).toBeNull();

      await closeDialog(failedDialogRef);
      await openDialog();

      expect(screen.getByLabelText('First name')).toHaveValue(currentUserMock.firstName);
      expect(document.body.querySelector('.update-profile-form__error')).toBeNull();
    });

    it('should show the change avatar form without a file and without an error when reopened', async () => {
      const failedDialogRef = await renderModal();

      await selectAvatarFile();
      await submitChangeAvatarForm();

      expect(userGatewayMock.changeAvatar).toHaveBeenCalledOnce();
      expect(notifierMock.error).toHaveBeenCalledWith('Failed to change avatar', 'Mock error');
      expect(screen.queryByText(changeAvatarError)).not.toBeInTheDocument();

      await closeDialog(failedDialogRef);
      await openDialog();

      expect(screen.queryByText(changeAvatarError)).not.toBeInTheDocument();

      // Файл не выбран, кнопка выключена: событие отправки идет напрямую.
      fireEvent.submit(document.body.querySelector('.change-avatar-form') as HTMLFormElement);

      expect(userGatewayMock.changeAvatar).toHaveBeenCalledOnce();
      expect(await screen.findByText(changeAvatarError)).toHaveTextContent('Select a file');
    });
  });
});

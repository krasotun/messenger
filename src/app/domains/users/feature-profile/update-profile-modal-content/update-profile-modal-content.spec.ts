import { inputBinding } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { fireEvent, render, screen, within } from '@testing-library/angular/zoneless';
import { userEvent, UserEvent } from '@testing-library/user-event';
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
import { ModalRef } from '@shared/ui/modal/modal-ref';
import { ModalMocks } from '@shared/ui/modal/testing';

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

describe('UpdateProfileModalContent', () => {
  let userGatewayMock: ReturnType<typeof UserMocks.userGateway>;
  let authGatewayMock: ReturnType<typeof UserMocks.authGateway>;
  let modalRefMock: ReturnType<typeof ModalMocks.modalRef>;
  let notifierMock: ReturnType<typeof NotificationMocks.notifier>;
  let user: UserEvent;

  const sharedProviders = () => [
    { provide: ModalRef, useValue: modalRefMock },
    { provide: NOTIFIER, useValue: notifierMock },
    { provide: USER_GATEWAY, useValue: userGatewayMock },
    { provide: AUTH_GATEWAY, useValue: authGatewayMock },
  ];

  // Смена аватара и Редактирование профиля идут через настоящий
  // CurrentSessionStore с восстановленной сессией.
  const renderModal = (currentUser: CurrentUser = currentUserMock) =>
    render(UpdateProfileModalContent, {
      bindings: [inputBinding('currentUser', () => currentUser)],
      providers: sharedProviders(),
      configureTestBed: (testBed) => {
        testBed.inject(CurrentSessionStore).restoreCurrentSession().subscribe();
      },
      waitForStableOnRender: true,
    });

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
    modalRefMock = ModalMocks.modalRef();
    notifierMock = NotificationMocks.notifier();
  });

  it('should create', async () => {
    const { fixture } = await renderModal();

    expect(fixture.componentInstance).toBeTruthy();
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
    it('should close the modal without a manual application tick', async () => {
      userGatewayMock.updateProfile.mockReturnValue(of({ user: currentUserMock }));
      await renderModal();

      await changeFirstNameAndSave();

      expect(modalRefMock.close).toHaveBeenCalledOnce();
    });
  });

  describe('closing without saving', () => {
    it('should not call updateProfile', async () => {
      await renderModal();

      expect(userGatewayMock.updateProfile).not.toHaveBeenCalled();
    });

    it('should not call changeAvatar even when a file has been selected', async () => {
      const { fixture } = await renderModal();

      await selectAvatarFile();

      fixture.destroy();

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
      expect(modalRefMock.close).not.toHaveBeenCalled();
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
    // render настраивает TestBed и второй раз в одном тесте не вызывается:
    // повторное открытие модалки идет через TestBed.createComponent.
    const reopenModal = async (): Promise<ComponentFixture<UpdateProfileModalContent>> => {
      const reopenedFixture = TestBed.createComponent(UpdateProfileModalContent);
      reopenedFixture.componentRef.setInput('currentUser', currentUserMock);
      await reopenedFixture.whenStable();

      return reopenedFixture;
    };

    beforeEach(() => {
      userGatewayMock.updateProfile.mockImplementation(() =>
        throwError(() => new ApplicationError('Mock error')),
      );
      userGatewayMock.changeAvatar.mockImplementation(() =>
        throwError(() => new ApplicationError('Mock error')),
      );
    });

    it('should show a form without an error when reopened after a failed save', async () => {
      const { fixture: failedFixture, container } = await renderModal();

      await changeFirstNameAndSave(container);
      await failedFixture.whenStable();

      expect(notifierMock.error).toHaveBeenCalledWith('Failed to update profile', 'Mock error');
      expect(container.querySelector('.update-profile-form__error')).toBeNull();

      failedFixture.destroy();

      const reopenedFixture = await reopenModal();
      const reopenedModal = within(reopenedFixture.nativeElement);

      expect(reopenedModal.getByLabelText('First name')).toHaveValue(currentUserMock.firstName);
      expect(reopenedFixture.nativeElement.querySelector('.update-profile-form__error')).toBeNull();
    });

    it('should show the change avatar form without a file and without an error when reopened', async () => {
      const { fixture: failedFixture, container } = await renderModal();

      await selectAvatarFile(container);
      await submitChangeAvatarForm(container);
      await failedFixture.whenStable();

      expect(userGatewayMock.changeAvatar).toHaveBeenCalledOnce();
      expect(notifierMock.error).toHaveBeenCalledWith('Failed to change avatar', 'Mock error');
      expect(within(container).queryByText(changeAvatarError)).not.toBeInTheDocument();

      failedFixture.destroy();

      const reopenedFixture = await reopenModal();
      const reopenedModal = within(reopenedFixture.nativeElement);

      expect(reopenedModal.queryByText(changeAvatarError)).not.toBeInTheDocument();

      // Файл не выбран, кнопка выключена: событие отправки идет напрямую.
      fireEvent.submit(
        reopenedFixture.nativeElement.querySelector('.change-avatar-form') as HTMLFormElement,
      );
      await reopenedFixture.whenStable();

      expect(userGatewayMock.changeAvatar).toHaveBeenCalledOnce();
      expect(reopenedModal.getByText(changeAvatarError)).toHaveTextContent('Select a file');
    });
  });
});

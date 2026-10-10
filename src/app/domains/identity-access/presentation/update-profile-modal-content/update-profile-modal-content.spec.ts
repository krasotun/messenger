import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { fireEvent, render, screen, within } from '@testing-library/angular/zoneless';
import { userEvent, UserEvent } from '@testing-library/user-event';
import { of, throwError } from 'rxjs';

import { AUTH_GATEWAY } from '../../application/auth.gateway';
import { ChangeAvatarService } from '../../application/change-avatar/change-avatar.service';
import { CurrentSessionStatus } from '../../application/current-session/current-session-status.type';
import { CurrentSessionService } from '../../application/current-session/current-session.service';
import { UpdateProfileService } from '../../application/update-profile/update-profile.service';
import { USER_GATEWAY } from '../../application/user.gateway';

import { UpdateProfileModalContent } from './update-profile-modal-content';

import { IdentityMocks } from '@domains/identity-access/testing';
import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
import { NotificationMocks } from '@shared/notifications/testing';
import { ModalRef } from '@shared/ui/modal/modal-ref';
import { ModalMocks } from '@shared/ui/modal/testing';

const currentUserMock = IdentityMocks.currentUser({
  firstName: 'firstName',
  secondName: 'secondName',
  displayName: 'displayName',
  login: 'login',
  email: 'email@mock.ru',
  phone: '+79991234567',
});

const initialValuesMock = IdentityMocks.updateProfileInput({
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
  let updateProfileServiceMock: ReturnType<typeof IdentityMocks.updateProfileService>;
  let changeAvatarServiceMock: ReturnType<typeof IdentityMocks.changeAvatarService>;
  let modalRefMock: ReturnType<typeof ModalMocks.modalRef>;
  let notifierMock: ReturnType<typeof NotificationMocks.notifier>;
  let user: UserEvent;

  const sharedProviders = () => [
    { provide: ModalRef, useValue: modalRefMock },
    { provide: NOTIFIER, useValue: notifierMock },
  ];

  // Оба use case живут в providers компонента модалки.
  const renderModal = () =>
    render(UpdateProfileModalContent, {
      providers: [
        ...sharedProviders(),
        { provide: CurrentSessionService, useValue: { currentUser: signal(currentUserMock) } },
      ],
      configureTestBed: (testBed) =>
        testBed.overrideComponent(UpdateProfileModalContent, {
          set: {
            providers: [
              { provide: UpdateProfileService, useValue: updateProfileServiceMock },
              { provide: ChangeAvatarService, useValue: changeAvatarServiceMock },
            ],
          },
        }),
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
    updateProfileServiceMock = IdentityMocks.updateProfileService(initialValuesMock);
    changeAvatarServiceMock = IdentityMocks.changeAvatarService();
    modalRefMock = ModalMocks.modalRef();
    notifierMock = NotificationMocks.notifier();
  });

  it('should create', async () => {
    const { fixture } = await renderModal();

    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('successful save', () => {
    it('should close the modal without a manual application tick', async () => {
      await renderModal();

      updateProfileServiceMock.succeeded$.next();

      expect(modalRefMock.close).toHaveBeenCalledOnce();
    });
  });

  describe('closing without saving', () => {
    it('should not call updateProfile', async () => {
      await renderModal();

      expect(updateProfileServiceMock.updateProfile).not.toHaveBeenCalled();
    });

    it('should not call changeAvatar even when a file has been selected', async () => {
      const { fixture } = await renderModal();

      await selectAvatarFile();

      fixture.destroy();

      expect(changeAvatarServiceMock.changeAvatar).not.toHaveBeenCalled();
    });
  });

  describe('both forms', () => {
    it('should be shown together', async () => {
      await renderModal();

      expect(screen.getByRole('button', { name: 'Change avatar' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });

    it('should keep the change avatar submit out of the update profile use case', async () => {
      await renderModal();

      await selectAvatarFile();
      await submitChangeAvatarForm();

      expect(changeAvatarServiceMock.changeAvatar).toHaveBeenCalledOnce();
      expect(updateProfileServiceMock.updateProfile).not.toHaveBeenCalled();
      expect(modalRefMock.close).not.toHaveBeenCalled();
    });

    it('should keep the update profile submit out of the change avatar use case', async () => {
      await renderModal();

      await changeFirstNameAndSave();

      expect(updateProfileServiceMock.updateProfile).toHaveBeenCalledOnce();
      expect(changeAvatarServiceMock.changeAvatar).not.toHaveBeenCalled();
    });
  });

  describe('flow lifetime', () => {
    let userGatewayMock: ReturnType<typeof IdentityMocks.userGateway>;
    let authGatewayMock: ReturnType<typeof IdentityMocks.authGateway>;

    const renderWithRealServices = () =>
      render(UpdateProfileModalContent, {
        providers: [
          ...sharedProviders(),
          { provide: USER_GATEWAY, useValue: userGatewayMock },
          { provide: AUTH_GATEWAY, useValue: authGatewayMock },
        ],
        configureTestBed: (testBed) =>
          testBed.inject(CurrentSessionService).updateCurrentUser(currentUserMock),
        waitForStableOnRender: true,
      });

    // render настраивает TestBed и второй раз в одном тесте не вызывается:
    // повторное открытие модалки идет через TestBed.createComponent.
    const reopenModal = async (): Promise<ComponentFixture<UpdateProfileModalContent>> => {
      const reopenedFixture = TestBed.createComponent(UpdateProfileModalContent);
      await reopenedFixture.whenStable();

      return reopenedFixture;
    };

    beforeEach(() => {
      userGatewayMock = IdentityMocks.userGateway();
      userGatewayMock.updateProfile.mockImplementation(() =>
        throwError(() => new ApplicationError('Mock error')),
      );
      userGatewayMock.changeAvatar.mockImplementation(() =>
        throwError(() => new ApplicationError('Mock error')),
      );

      authGatewayMock = IdentityMocks.authGateway();
      authGatewayMock.currentSession.mockImplementation(() =>
        of({ status: CurrentSessionStatus.Authenticated, user: currentUserMock }),
      );
    });

    it('should show a form without an error when reopened after a failed save', async () => {
      const { fixture: failedFixture, container } = await renderWithRealServices();

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
      const { fixture: failedFixture, container } = await renderWithRealServices();

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

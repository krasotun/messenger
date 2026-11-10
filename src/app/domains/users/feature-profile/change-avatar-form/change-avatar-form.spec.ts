import { ComponentFixture, TestBed } from '@angular/core/testing';
import { fireEvent, render, screen } from '@testing-library/angular/zoneless';
import { userEvent, UserEvent } from '@testing-library/user-event';
import { of, Subject, throwError } from 'rxjs';

import { AUTH_GATEWAY } from '../../data/auth-gateway';
import { CurrentSessionStore } from '../../data/current-session-store';
import { ChangeAvatarResult, USER_GATEWAY } from '../../data/user-gateway';

import { ChangeAvatarForm } from './change-avatar-form';

import { UserMocks } from '@domains/users/testing';
import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
import { NotificationMocks } from '@shared/notifications/testing';
import { Nullable } from '@shared/types';

const currentUserMock = UserMocks.currentUser({
  avatar: 'https://mock.host/resources/path/to/avatar.png',
});

const pngFileMock = new File(['mockContent'], 'avatar.png', { type: 'image/png' });
const otherPngFileMock = new File(['otherContent'], 'other-avatar.png', { type: 'image/png' });
const pdfFileMock = new File(['mockContent'], 'avatar.pdf', { type: 'application/pdf' });

describe('ChangeAvatarForm', () => {
  let userGatewayMock: ReturnType<typeof UserMocks.userGateway>;
  let fixture: ComponentFixture<ChangeAvatarForm>;
  let container: HTMLElement;
  let user: UserEvent;
  let createObjectUrlSpy: ReturnType<typeof vi.spyOn>;
  let revokeObjectUrlSpy: ReturnType<typeof vi.spyOn>;
  let createdObjectUrlCount: number;

  // Подпись поля складывается из «Avatar», «Choose file» и имени файла внутри label.
  const getFileInput = (): HTMLInputElement => screen.getByLabelText(/Choose file/);

  const getSubmitButton = (): HTMLElement => screen.getByRole('button', { name: 'Change avatar' });

  const getPreviewSrc = (): Nullable<string> =>
    screen.getByRole('img', { name: 'Avatar preview' }).getAttribute('src');

  const queryErrorMessage = (): Nullable<HTMLElement> =>
    screen.queryByText(/^Avatar change failed:/);

  const selectFile = async (file: File): Promise<void> => {
    await user.upload(getFileInput(), file);
  };

  // Выключенная кнопка не дает отправить форму: событие идет напрямую.
  const submitForm = async (): Promise<void> => {
    fireEvent.submit(container.querySelector('form') as HTMLFormElement);
    await fixture.whenStable();
  };

  beforeEach(async () => {
    // applyAccept: false - пользователь может выбрать «все файлы» в диалоге,
    // и форма сама должна отсечь неподдерживаемый формат.
    user = userEvent.setup({ applyAccept: false });
    userGatewayMock = UserMocks.userGateway();
    const authGatewayMock = UserMocks.authGateway();
    authGatewayMock.currentSession.mockReturnValue(
      of(UserMocks.authenticatedSession(currentUserMock)),
    );
    createdObjectUrlCount = 0;

    createObjectUrlSpy = vi
      .spyOn(URL, 'createObjectURL')
      .mockImplementation(() => `blob:mock/${(createdObjectUrlCount += 1)}`);
    revokeObjectUrlSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);

    ({ fixture, container } = await render(ChangeAvatarForm, {
      providers: [
        { provide: AUTH_GATEWAY, useValue: authGatewayMock },
        { provide: USER_GATEWAY, useValue: userGatewayMock },
        { provide: NOTIFIER, useValue: NotificationMocks.notifier() },
      ],
      configureTestBed: () => {
        TestBed.inject(CurrentSessionStore).restoreCurrentSession().subscribe();
      },
      waitForStableOnRender: true,
    }));
  });

  afterEach(() => {
    createObjectUrlSpy.mockRestore();
    revokeObjectUrlSpy.mockRestore();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('opened form', () => {
    it('should show no selected file and no preview', () => {
      expect(getFileInput().files).toHaveLength(0);
      expect(createObjectUrlSpy).not.toHaveBeenCalled();
      expect(getPreviewSrc()).toBe(currentUserMock.avatar);
      expect(queryErrorMessage()).not.toBeInTheDocument();
    });

    it('should disable the submit button while no file is selected', () => {
      expect(getSubmitButton()).toBeDisabled();
    });
  });

  describe('supported file selected', () => {
    it('should show the preview instead of the current avatar', async () => {
      await selectFile(pngFileMock);

      expect(createObjectUrlSpy).toHaveBeenCalledOnce();
      expect(createObjectUrlSpy).toHaveBeenCalledWith(pngFileMock);
      expect(getPreviewSrc()).toBe('blob:mock/1');
    });

    it('should keep the submit button enabled', async () => {
      await selectFile(pngFileMock);

      expect(getSubmitButton()).toBeEnabled();
    });
  });

  describe('unsupported file selected', () => {
    it('should not create a preview and should show the format error', async () => {
      await selectFile(pdfFileMock);

      expect(createObjectUrlSpy).not.toHaveBeenCalled();
      expect(getPreviewSrc()).toBe(currentUserMock.avatar);
      expect(queryErrorMessage()).toHaveTextContent('JPEG');
    });

    it('should disable the submit button', async () => {
      await selectFile(pdfFileMock);

      expect(getSubmitButton()).toBeDisabled();
    });

    it('should not call changeAvatar on submit', async () => {
      await selectFile(pdfFileMock);
      await submitForm();

      expect(userGatewayMock.changeAvatar).not.toHaveBeenCalled();
      expect(queryErrorMessage()).toHaveTextContent('JPEG');
    });
  });

  describe('submit without a selected file', () => {
    it('should disable the submit button', () => {
      expect(getSubmitButton()).toBeDisabled();
    });

    it('should not call changeAvatar and should ask to select a file', async () => {
      await submitForm();

      expect(userGatewayMock.changeAvatar).not.toHaveBeenCalled();
      expect(queryErrorMessage()).toHaveTextContent('Select a file');
    });
  });

  describe('valid submit', () => {
    it('should call changeAvatar with the selected file', async () => {
      userGatewayMock.changeAvatar.mockReturnValue(new Subject<ChangeAvatarResult>());
      await selectFile(pngFileMock);
      await user.click(getSubmitButton());

      expect(userGatewayMock.changeAvatar).toHaveBeenCalledOnce();
      expect(userGatewayMock.changeAvatar).toHaveBeenCalledWith({ file: pngFileMock });
    });
  });

  describe('submitting state', () => {
    it('should disable the file input and the submit button', async () => {
      userGatewayMock.changeAvatar.mockReturnValue(new Subject<ChangeAvatarResult>());
      await selectFile(pngFileMock);
      await user.click(getSubmitButton());

      expect(getFileInput()).toBeDisabled();
      expect(getSubmitButton()).toBeDisabled();
    });
  });

  describe('backend rejects the submission', () => {
    it('should not show a submit error and should keep the selected file with its preview', async () => {
      userGatewayMock.changeAvatar.mockReturnValue(
        throwError(() => new ApplicationError('mockReason')),
      );
      await selectFile(pngFileMock);
      await user.click(getSubmitButton());

      expect(queryErrorMessage()).not.toBeInTheDocument();
      expect(getPreviewSrc()).toBe('blob:mock/1');
    });
  });

  describe('success state', () => {
    it('should reset the form to the state without a selected file and preview, without a manual application tick', async () => {
      userGatewayMock.changeAvatar.mockReturnValue(of({ user: currentUserMock }));
      await selectFile(pngFileMock);
      await user.click(getSubmitButton());
      await fixture.whenStable();

      expect(getPreviewSrc()).toBe(currentUserMock.avatar);

      await submitForm();

      expect(userGatewayMock.changeAvatar).toHaveBeenCalledOnce();
      expect(queryErrorMessage()).toHaveTextContent('Select a file');
    });
  });

  describe('object url lifecycle', () => {
    it('should revoke the previous object url when another file is selected', async () => {
      await selectFile(pngFileMock);
      await selectFile(otherPngFileMock);

      expect(revokeObjectUrlSpy).toHaveBeenCalledOnce();
      expect(revokeObjectUrlSpy).toHaveBeenCalledWith('blob:mock/1');
    });

    it('should revoke the current object url on destroy', async () => {
      await selectFile(pngFileMock);

      fixture.destroy();

      expect(revokeObjectUrlSpy).toHaveBeenCalledOnce();
      expect(revokeObjectUrlSpy).toHaveBeenCalledWith('blob:mock/1');
    });
  });
});

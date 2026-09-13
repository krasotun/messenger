import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { ChangeAvatarService } from '../../application/change-avatar/change-avatar.service';
import { CurrentSessionService } from '../../application/current-session/current-session.service';
import { CurrentUser } from '../../application/current-session/current-user.type';

import { ChangeAvatarForm } from './change-avatar-form';

import { Nullable } from '@shared/types';

let changeAvatarServiceMock: {
  isSubmitting: WritableSignal<boolean>;
  succeeded$: Subject<void>;
  changeAvatar: ReturnType<typeof vi.fn>;
};

let currentSessionServiceMock: {
  currentUser: WritableSignal<Nullable<CurrentUser>>;
};

const currentUserMock: CurrentUser = {
  id: 1,
  firstName: 'firstName',
  secondName: 'secondName',
  displayName: 'displayName',
  login: 'login',
  email: 'email',
  phone: 'phone',
  avatar: 'https://mock.host/resources/path/to/avatar.png',
};

const pngFileMock = new File(['mockContent'], 'avatar.png', { type: 'image/png' });
const pdfFileMock = new File(['mockContent'], 'avatar.pdf', { type: 'application/pdf' });

describe('ChangeAvatarForm', () => {
  let component: ChangeAvatarForm;
  let fixture: ComponentFixture<ChangeAvatarForm>;
  let createObjectUrlSpy: ReturnType<typeof vi.spyOn>;
  let revokeObjectUrlSpy: ReturnType<typeof vi.spyOn>;
  let createdObjectUrlCount: number;

  const getFileInput = (): HTMLInputElement =>
    fixture.nativeElement.querySelector('.change-avatar-form__file-input');

  const getSubmitButton = (): HTMLButtonElement =>
    fixture.nativeElement.querySelector('button[type="submit"]');

  const getAvatarImage = (): HTMLImageElement | null =>
    fixture.nativeElement.querySelector('.avatar__image');

  const getErrorMessage = (): string =>
    fixture.nativeElement.querySelector('.change-avatar-form__error')?.textContent?.trim() ?? '';

  const selectFile = (file: File) => {
    const fileInput = getFileInput();

    Object.defineProperty(fileInput, 'files', { value: [file], configurable: true });
    fileInput.dispatchEvent(new Event('change'));

    fixture.detectChanges();
  };

  const submitForm = () => {
    const formElement: HTMLFormElement = fixture.nativeElement.querySelector('form');
    formElement.dispatchEvent(new Event('submit', { cancelable: true }));

    fixture.detectChanges();
  };

  beforeEach(async () => {
    createdObjectUrlCount = 0;

    createObjectUrlSpy = vi
      .spyOn(URL, 'createObjectURL')
      .mockImplementation(() => `blob:mock/${(createdObjectUrlCount += 1)}`);
    revokeObjectUrlSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);

    changeAvatarServiceMock = {
      isSubmitting: signal(false),
      succeeded$: new Subject<void>(),
      changeAvatar: vi.fn(),
    };

    currentSessionServiceMock = {
      currentUser: signal(currentUserMock),
    };

    await TestBed.configureTestingModule({
      imports: [ChangeAvatarForm],
      providers: [
        {
          provide: ChangeAvatarService,
          useValue: changeAvatarServiceMock,
        },
        {
          provide: CurrentSessionService,
          useValue: currentSessionServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangeAvatarForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    createObjectUrlSpy.mockRestore();
    revokeObjectUrlSpy.mockRestore();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('opened form', () => {
    it('should show no selected file and no preview', () => {
      fixture.detectChanges();

      expect(getFileInput().files).toHaveLength(0);
      expect(createObjectUrlSpy).not.toHaveBeenCalled();
      expect(getAvatarImage()?.getAttribute('src')).toBe(currentUserMock.avatar);
      expect(getErrorMessage()).toBe('');
    });

    it('should disable the submit button while no file is selected', () => {
      fixture.detectChanges();

      expect(getSubmitButton().disabled).toBe(true);
    });
  });

  describe('supported file selected', () => {
    it('should show the preview instead of the current avatar', () => {
      fixture.detectChanges();

      selectFile(pngFileMock);

      expect(createObjectUrlSpy).toHaveBeenCalledOnce();
      expect(createObjectUrlSpy).toHaveBeenCalledWith(pngFileMock);
      expect(getAvatarImage()?.getAttribute('src')).toBe('blob:mock/1');
    });

    it('should keep the submit button enabled', () => {
      fixture.detectChanges();

      selectFile(pngFileMock);

      expect(getSubmitButton().disabled).toBe(false);
    });
  });

  describe('unsupported file selected', () => {
    it('should not create a preview and should show the format error', () => {
      fixture.detectChanges();

      selectFile(pdfFileMock);

      expect(createObjectUrlSpy).not.toHaveBeenCalled();
      expect(getAvatarImage()?.getAttribute('src')).toBe(currentUserMock.avatar);
      expect(getErrorMessage()).toContain('JPEG');
    });

    it('should disable the submit button', () => {
      fixture.detectChanges();

      selectFile(pdfFileMock);

      expect(getSubmitButton().disabled).toBe(true);
    });

    it('should not call changeAvatar on submit', () => {
      fixture.detectChanges();

      selectFile(pdfFileMock);
      submitForm();

      expect(changeAvatarServiceMock.changeAvatar).not.toHaveBeenCalled();
      expect(getErrorMessage()).toContain('JPEG');
    });
  });

  describe('submit without a selected file', () => {
    it('should disable the submit button', () => {
      fixture.detectChanges();

      expect(getSubmitButton().disabled).toBe(true);
    });

    it('should not call changeAvatar and should ask to select a file', () => {
      fixture.detectChanges();

      submitForm();

      expect(changeAvatarServiceMock.changeAvatar).not.toHaveBeenCalled();
      expect(getErrorMessage()).toContain('Select a file');
    });
  });

  describe('valid submit', () => {
    it('should call changeAvatar with the selected file', () => {
      fixture.detectChanges();

      selectFile(pngFileMock);
      submitForm();

      expect(changeAvatarServiceMock.changeAvatar).toHaveBeenCalledOnce();
      expect(changeAvatarServiceMock.changeAvatar).toHaveBeenCalledWith({ file: pngFileMock });
    });
  });

  describe('submitting state', () => {
    it('should disable the file input and the submit button', () => {
      changeAvatarServiceMock.isSubmitting.set(true);
      fixture.detectChanges();

      expect(getFileInput().disabled).toBe(true);
      expect(getSubmitButton().disabled).toBe(true);
    });
  });

  describe('backend rejects the submission', () => {
    it('should not show a submit error and should keep the selected file with its preview', () => {
      fixture.detectChanges();

      selectFile(pngFileMock);
      submitForm();

      fixture.detectChanges();

      expect(getErrorMessage()).toBe('');
      expect(getAvatarImage()?.getAttribute('src')).toBe('blob:mock/1');
    });
  });

  describe('success state', () => {
    it('should reset the form to the state without a selected file and preview, without a manual application tick', () => {
      fixture.detectChanges();

      selectFile(pngFileMock);

      changeAvatarServiceMock.succeeded$.next();
      fixture.detectChanges();

      expect(getAvatarImage()?.getAttribute('src')).toBe(currentUserMock.avatar);

      submitForm();

      expect(changeAvatarServiceMock.changeAvatar).not.toHaveBeenCalled();
      expect(getErrorMessage()).toContain('Select a file');
    });
  });

  describe('object url lifecycle', () => {
    it('should revoke the previous object url when another file is selected', () => {
      fixture.detectChanges();

      selectFile(pngFileMock);
      selectFile(pngFileMock);

      expect(revokeObjectUrlSpy).toHaveBeenCalledOnce();
      expect(revokeObjectUrlSpy).toHaveBeenCalledWith('blob:mock/1');
    });

    it('should revoke the current object url on destroy', () => {
      fixture.detectChanges();

      selectFile(pngFileMock);

      fixture.destroy();

      expect(revokeObjectUrlSpy).toHaveBeenCalledOnce();
      expect(revokeObjectUrlSpy).toHaveBeenCalledWith('blob:mock/1');
    });
  });
});

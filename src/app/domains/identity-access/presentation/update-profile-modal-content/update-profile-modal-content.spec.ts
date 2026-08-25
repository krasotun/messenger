import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthFlowStatus } from '../../application/auth-flow-status';
import { UpdateProfileInput } from '../../application/update-profile/update-profile.input';
import { UpdateProfileService } from '../../application/update-profile/update-profile.service';

import { UpdateProfileModalContent } from './update-profile-modal-content';

import { ModalRef } from '@shared/ui/modal/modal-ref';

const initialValuesMock: UpdateProfileInput = {
  firstName: 'firstName',
  secondName: 'secondName',
  displayName: 'displayName',
  login: 'login',
  email: 'email@mock.ru',
  phone: '+79991234567',
};

let updateProfileServiceMock: {
  initialValues: WritableSignal<UpdateProfileInput>;
  isSubmitting: WritableSignal<boolean>;
  errorMessage: WritableSignal<string | null>;
  status: WritableSignal<AuthFlowStatus>;
  updateProfile: ReturnType<typeof vi.fn>;
  reset: ReturnType<typeof vi.fn>;
};

let modalRefMock: {
  close: ReturnType<typeof vi.fn>;
};

describe('UpdateProfileModalContent', () => {
  let fixture: ComponentFixture<UpdateProfileModalContent>;

  beforeEach(async () => {
    updateProfileServiceMock = {
      initialValues: signal(initialValuesMock),
      isSubmitting: signal(false),
      errorMessage: signal(null),
      status: signal(AuthFlowStatus.Idle),
      updateProfile: vi.fn(),
      reset: vi.fn(),
    };

    modalRefMock = {
      close: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [UpdateProfileModalContent],
      providers: [
        {
          provide: UpdateProfileService,
          useValue: updateProfileServiceMock,
        },
        {
          provide: ModalRef,
          useValue: modalRefMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateProfileModalContent);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('successful save', () => {
    it('should close the modal', () => {
      fixture.detectChanges();

      updateProfileServiceMock.status.set(AuthFlowStatus.Success);

      fixture.detectChanges();

      expect(modalRefMock.close).toHaveBeenCalledOnce();
    });
  });

  describe('closing without saving', () => {
    it('should not call updateProfile', () => {
      fixture.detectChanges();

      expect(updateProfileServiceMock.updateProfile).not.toHaveBeenCalled();
    });
  });
});

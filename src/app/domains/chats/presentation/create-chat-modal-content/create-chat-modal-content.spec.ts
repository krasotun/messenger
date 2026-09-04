import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { throwError } from 'rxjs';

import { CHAT_GATEWAY } from '../../application/chat.gateway';
import { CreateChatStatus } from '../../application/create-chat/create-chat-status';
import { CreateChatService } from '../../application/create-chat/create-chat.service';
import { CreateChatForm } from '../create-chat-form/create-chat-form';

import { CreateChatModalContent } from './create-chat-modal-content';

import { ApplicationError } from '@shared/errors';
import { ModalRef } from '@shared/ui/modal/modal-ref';

let createChatServiceMock: {
  isSubmitting: WritableSignal<boolean>;
  errorMessage: WritableSignal<string | null>;
  status: WritableSignal<CreateChatStatus>;
  createChat: ReturnType<typeof vi.fn>;
  reset: ReturnType<typeof vi.fn>;
};

let modalRefMock: {
  close: ReturnType<typeof vi.fn>;
};

describe('CreateChatModalContent', () => {
  let fixture: ComponentFixture<CreateChatModalContent>;

  beforeEach(async () => {
    createChatServiceMock = {
      isSubmitting: signal(false),
      errorMessage: signal(null),
      status: signal(CreateChatStatus.Idle),
      createChat: vi.fn(),
      reset: vi.fn(),
    };

    modalRefMock = {
      close: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [CreateChatModalContent],
      providers: [
        {
          provide: ModalRef,
          useValue: modalRefMock,
        },
      ],
    });

    TestBed.overrideComponent(CreateChatModalContent, {
      set: {
        providers: [
          {
            provide: CreateChatService,
            useValue: createChatServiceMock,
          },
        ],
      },
    });

    await TestBed.compileComponents();

    fixture = TestBed.createComponent(CreateChatModalContent);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('successful creation', () => {
    it('should close the modal', () => {
      fixture.detectChanges();

      createChatServiceMock.status.set(CreateChatStatus.Success);

      fixture.detectChanges();

      expect(modalRefMock.close).toHaveBeenCalledOnce();
    });
  });

  describe('closing without submitting', () => {
    it('should not call createChat', () => {
      fixture.detectChanges();

      expect(createChatServiceMock.createChat).not.toHaveBeenCalled();
    });
  });

  describe('empty title', () => {
    it('should not call createChat and should not close the modal', () => {
      fixture.detectChanges();

      fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));

      fixture.detectChanges();

      expect(createChatServiceMock.createChat).not.toHaveBeenCalled();
      expect(modalRefMock.close).not.toHaveBeenCalled();
    });
  });

  describe('flow lifetime', () => {
    let chatGatewayMock: {
      chats: ReturnType<typeof vi.fn>;
      createChat: ReturnType<typeof vi.fn>;
    };

    const openModal = async (): Promise<ComponentFixture<CreateChatModalContent>> => {
      const openedFixture = TestBed.createComponent(CreateChatModalContent);
      await openedFixture.whenStable();
      openedFixture.detectChanges();

      return openedFixture;
    };

    const submitWithError = async (
      openedFixture: ComponentFixture<CreateChatModalContent>,
    ): Promise<void> => {
      const form: CreateChatForm = openedFixture.debugElement.query(
        By.directive(CreateChatForm),
      ).componentInstance;

      form.createChatForm.setValue({ title: 'typedTitle' });

      openedFixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));

      await openedFixture.whenStable();
      openedFixture.detectChanges();
    };

    beforeEach(async () => {
      TestBed.resetTestingModule();

      chatGatewayMock = {
        chats: vi.fn(),
        createChat: vi.fn(() => throwError(() => new ApplicationError('Mock error'))),
      };

      TestBed.configureTestingModule({
        imports: [CreateChatModalContent],
        providers: [
          {
            provide: CHAT_GATEWAY,
            useValue: chatGatewayMock,
          },
          {
            provide: ModalRef,
            useValue: modalRefMock,
          },
        ],
      });

      await TestBed.compileComponents();
    });

    it('should show an empty form without an error when reopened after a failed creation', async () => {
      const failedFixture = await openModal();

      await submitWithError(failedFixture);

      expect(failedFixture.nativeElement.querySelector('.create-chat-form__error')).not.toBeNull();

      failedFixture.destroy();

      const reopenedFixture = await openModal();

      const reopenedTitleInput: HTMLInputElement =
        reopenedFixture.nativeElement.querySelector('#title');

      expect(reopenedTitleInput.value).toBe('');

      expect(reopenedFixture.nativeElement.querySelector('.create-chat-form__error')).toBeNull();
    });
  });
});

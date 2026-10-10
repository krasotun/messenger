import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { throwError } from 'rxjs';

import { CHAT_GATEWAY } from '../../application/chat.gateway';
import { CreateChatService } from '../../application/create-chat/create-chat.service';
import { CreateChatForm } from '../create-chat-form/create-chat-form';

import { CreateChatModalContent } from './create-chat-modal-content';

import { ChatMocks } from '@domains/chats/testing';
import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
import { NotificationMocks } from '@shared/notifications/testing';
import { ModalRef } from '@shared/ui/modal/modal-ref';
import { ModalMocks } from '@shared/ui/modal/testing';

describe('CreateChatModalContent', () => {
  let createChatServiceMock: ReturnType<typeof ChatMocks.createChatService>;
  let modalRefMock: ReturnType<typeof ModalMocks.modalRef>;
  let notifierMock: ReturnType<typeof NotificationMocks.notifier>;
  let fixture: ComponentFixture<CreateChatModalContent>;

  beforeEach(async () => {
    createChatServiceMock = ChatMocks.createChatService();
    modalRefMock = ModalMocks.modalRef();
    notifierMock = NotificationMocks.notifier();

    TestBed.configureTestingModule({
      imports: [CreateChatModalContent],
      providers: [
        {
          provide: ModalRef,
          useValue: modalRefMock,
        },
        {
          provide: NOTIFIER,
          useValue: notifierMock,
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
    it('should close the modal without a manual application tick', () => {
      fixture.detectChanges();

      createChatServiceMock.succeeded$.next();

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
    let chatGatewayMock: ReturnType<typeof ChatMocks.chatGateway>;

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

      chatGatewayMock = ChatMocks.chatGateway();
      chatGatewayMock.createChat.mockImplementation(() =>
        throwError(() => new ApplicationError('Mock error')),
      );

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
          {
            provide: NOTIFIER,
            useValue: notifierMock,
          },
        ],
      });

      await TestBed.compileComponents();
    });

    it('should show an empty form without an error when reopened after a failed creation', async () => {
      const failedFixture = await openModal();

      await submitWithError(failedFixture);

      expect(notifierMock.error).toHaveBeenCalledWith('Failed to create chat', 'Mock error');
      expect(failedFixture.nativeElement.querySelector('.create-chat-form__error')).toBeNull();

      failedFixture.destroy();

      const reopenedFixture = await openModal();

      const reopenedTitleInput: HTMLInputElement =
        reopenedFixture.nativeElement.querySelector('input');

      expect(reopenedTitleInput.value).toBe('');

      expect(reopenedFixture.nativeElement.querySelector('.create-chat-form__error')).toBeNull();
    });
  });
});

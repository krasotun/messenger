import { TestBed } from '@angular/core/testing';
import { fireEvent, render, within } from '@testing-library/angular/zoneless';
import { userEvent } from '@testing-library/user-event';
import { throwError } from 'rxjs';

import { CHAT_GATEWAY } from '../../application/chat.gateway';
import { CreateChatService } from '../../application/create-chat/create-chat.service';

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

  const sharedProviders = () => [
    { provide: ModalRef, useValue: modalRefMock },
    { provide: NOTIFIER, useValue: notifierMock },
  ];

  // CreateChatService живет в providers компонента модалки.
  const renderModal = () =>
    render(CreateChatModalContent, {
      providers: sharedProviders(),
      configureTestBed: (testBed) =>
        testBed.overrideComponent(CreateChatModalContent, {
          set: { providers: [{ provide: CreateChatService, useValue: createChatServiceMock }] },
        }),
      waitForStableOnRender: true,
    });

  beforeEach(() => {
    createChatServiceMock = ChatMocks.createChatService();
    modalRefMock = ModalMocks.modalRef();
    notifierMock = NotificationMocks.notifier();
  });

  it('should create', async () => {
    const { fixture } = await renderModal();

    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('successful creation', () => {
    it('should close the modal without a manual application tick', async () => {
      await renderModal();

      createChatServiceMock.succeeded$.next();

      expect(modalRefMock.close).toHaveBeenCalledOnce();
    });
  });

  describe('closing without submitting', () => {
    it('should not call createChat', async () => {
      await renderModal();

      expect(createChatServiceMock.createChat).not.toHaveBeenCalled();
    });
  });

  describe('empty title', () => {
    // Кнопка выключена, пользовательского пути к submit нет: проверяем защиту.
    it('should not call createChat and should not close the modal', async () => {
      const { container } = await renderModal();

      fireEvent.submit(container.querySelector('form') as HTMLFormElement);

      expect(createChatServiceMock.createChat).not.toHaveBeenCalled();
      expect(modalRefMock.close).not.toHaveBeenCalled();
    });
  });

  describe('flow lifetime', () => {
    let chatGatewayMock: ReturnType<typeof ChatMocks.chatGateway>;

    beforeEach(() => {
      chatGatewayMock = ChatMocks.chatGateway();
      chatGatewayMock.createChat.mockImplementation(() =>
        throwError(() => new ApplicationError('Mock error')),
      );
    });

    // render настраивает TestBed и второй раз в одном тесте не вызывается:
    // повторное открытие модалки идет через TestBed.createComponent.
    it('should show an empty form without an error when reopened after a failed creation', async () => {
      const user = userEvent.setup();
      const { fixture: failedFixture, container } = await render(CreateChatModalContent, {
        providers: [...sharedProviders(), { provide: CHAT_GATEWAY, useValue: chatGatewayMock }],
        waitForStableOnRender: true,
      });
      const failedModal = within(container);

      await user.type(failedModal.getByLabelText('Title'), 'typedTitle');
      await user.click(failedModal.getByRole('button', { name: 'Create' }));
      await failedFixture.whenStable();

      expect(notifierMock.error).toHaveBeenCalledWith('Failed to create chat', 'Mock error');
      expect(container.querySelector('.create-chat-form__error')).toBeNull();

      failedFixture.destroy();

      const reopenedFixture = TestBed.createComponent(CreateChatModalContent);
      await reopenedFixture.whenStable();
      const reopenedModal = within(reopenedFixture.nativeElement);

      expect(reopenedModal.getByLabelText('Title')).toHaveValue('');
      expect(reopenedFixture.nativeElement.querySelector('.create-chat-form__error')).toBeNull();
    });
  });
});

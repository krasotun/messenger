import { TestBed } from '@angular/core/testing';
import { fireEvent, render, within } from '@testing-library/angular/zoneless';
import { userEvent } from '@testing-library/user-event';
import { of, Subject, throwError } from 'rxjs';

import { CHAT_GATEWAY, CreateChatResult } from '../../data/chat-gateway';
import { ChatListStore } from '../../data/chat-list-store';

import { CreateChatModalContent } from './create-chat-modal-content';

import { ChatMocks } from '@domains/chats/testing';
import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
import { NotificationMocks } from '@shared/notifications/testing';
import { ModalRef } from '@shared/ui/modal/modal-ref';
import { ModalMocks } from '@shared/ui/modal/testing';

describe('CreateChatModalContent', () => {
  let chatGatewayMock: ReturnType<typeof ChatMocks.chatGateway>;
  let modalRefMock: ReturnType<typeof ModalMocks.modalRef>;
  let notifierMock: ReturnType<typeof NotificationMocks.notifier>;

  const sharedProviders = () => [
    ChatListStore,
    { provide: CHAT_GATEWAY, useValue: chatGatewayMock },
    { provide: ModalRef, useValue: modalRefMock },
    { provide: NOTIFIER, useValue: notifierMock },
  ];

  const renderModal = () =>
    render(CreateChatModalContent, {
      providers: sharedProviders(),
      waitForStableOnRender: true,
    });

  beforeEach(() => {
    chatGatewayMock = ChatMocks.chatGateway();
    modalRefMock = ModalMocks.modalRef();
    notifierMock = NotificationMocks.notifier();
  });

  it('should create', async () => {
    const { fixture } = await renderModal();

    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('successful creation', () => {
    it('should close the modal without a manual application tick', async () => {
      const user = userEvent.setup();
      chatGatewayMock.chats.mockReturnValue(of([]));
      chatGatewayMock.createChat.mockReturnValue(of({ id: 1 }));
      const { container } = await renderModal();
      const modal = within(container);

      await user.type(modal.getByLabelText('Title'), 'typedTitle');
      await user.click(modal.getByRole('button', { name: 'Create' }));

      expect(modalRefMock.close).toHaveBeenCalledOnce();
    });
  });

  describe('closing without submitting', () => {
    it('should not call createChat', async () => {
      await renderModal();

      expect(chatGatewayMock.createChat).not.toHaveBeenCalled();
    });
  });

  describe('empty title', () => {
    // Кнопка выключена, пользовательского пути к submit нет: проверяем защиту.
    it('should not call createChat and should not close the modal', async () => {
      const { container } = await renderModal();

      fireEvent.submit(container.querySelector('form') as HTMLFormElement);

      expect(chatGatewayMock.createChat).not.toHaveBeenCalled();
      expect(modalRefMock.close).not.toHaveBeenCalled();
    });
  });

  describe('flow lifetime', () => {
    beforeEach(() => {
      chatGatewayMock.createChat.mockImplementation(() =>
        throwError(() => new ApplicationError('Mock error')),
      );
    });

    // render настраивает TestBed и второй раз в одном тесте не вызывается:
    // повторное открытие модалки идет через TestBed.createComponent.
    it('should show an empty form without an error when reopened after a failed creation', async () => {
      const user = userEvent.setup();
      const { fixture: failedFixture, container } = await render(CreateChatModalContent, {
        providers: sharedProviders(),
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

    it('should keep the reopened form usable while the previous creation has not answered yet', async () => {
      chatGatewayMock.createChat.mockReturnValue(new Subject<CreateChatResult>());
      const user = userEvent.setup();
      const { fixture: firstFixture, container } = await renderModal();
      const firstModal = within(container);

      await user.type(firstModal.getByLabelText('Title'), 'typedTitle');
      await user.click(firstModal.getByRole('button', { name: 'Create' }));
      await firstFixture.whenStable();

      firstFixture.destroy();

      const reopenedFixture = TestBed.createComponent(CreateChatModalContent);
      await reopenedFixture.whenStable();
      const reopenedModal = within(reopenedFixture.nativeElement);

      await user.type(reopenedModal.getByLabelText('Title'), 'anotherTitle');

      expect(reopenedModal.getByLabelText('Title')).toBeEnabled();
      expect(reopenedModal.getByRole('button', { name: 'Create' })).toBeEnabled();
    });

    it('should not cancel the creation when the modal is closed before the gateway answers', async () => {
      const createChat$ = new Subject<CreateChatResult>();
      chatGatewayMock.createChat.mockReturnValue(createChat$);
      const user = userEvent.setup();
      const { fixture, container } = await renderModal();
      const modal = within(container);

      await user.type(modal.getByLabelText('Title'), 'typedTitle');
      await user.click(modal.getByRole('button', { name: 'Create' }));
      await fixture.whenStable();

      fixture.destroy();

      createChat$.error(new ApplicationError('Mock error'));

      expect(notifierMock.error).toHaveBeenCalledWith('Failed to create chat', 'Mock error');
    });
  });
});

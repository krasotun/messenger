import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/angular/zoneless';
import { userEvent } from '@testing-library/user-event';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { of, Subject, throwError } from 'rxjs';

import { CHAT_GATEWAY, CreateChatResult } from '../../data/chat-gateway';
import { ChatListStore } from '../../data/chat-list-store';

import { CreateChatDialogData, CreateChatModalContent } from './create-chat-modal-content';

import { ChatMocks } from '@domains/chats/testing';
import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
import { NotificationMocks } from '@shared/notifications/testing';
import { DIALOG_DEFAULTS } from '@shared/ui/dialog/dialog-defaults.constants';

// Диалог кита вешается на body и живет вне фикстуры: хост нужен только затем,
// чтобы render поднял TestBed с провайдерами и убрал за собой.
@Component({
  selector: 'app-test-host',
  template: '',
})
class TestHost {}

describe('CreateChatModalContent', () => {
  let chatGatewayMock: ReturnType<typeof ChatMocks.chatGateway>;
  let notifierMock: ReturnType<typeof NotificationMocks.notifier>;

  const renderHost = () =>
    render(TestHost, {
      providers: [
        ChatListStore,
        DialogService,
        { provide: CHAT_GATEWAY, useValue: chatGatewayMock },
        { provide: NOTIFIER, useValue: notifierMock },
      ],
      waitForStableOnRender: true,
    });

  // Открываем так же, как ChatList: настоящий DialogService, Стор едет в data.
  const openDialog = async (): Promise<DynamicDialogRef<CreateChatModalContent>> => {
    const dialogRef = TestBed.inject(DialogService).open(CreateChatModalContent, {
      ...DIALOG_DEFAULTS,
      header: 'New chat',
      data: { chatListStore: TestBed.inject(ChatListStore) } satisfies CreateChatDialogData,
    });

    if (!dialogRef) {
      throw new Error('Dialog was not opened');
    }

    await screen.findByLabelText('Title');

    return dialogRef;
  };

  const closeDialog = async (dialogRef: DynamicDialogRef): Promise<void> => {
    dialogRef.close();

    await waitFor(() => expect(screen.queryByLabelText('Title')).not.toBeInTheDocument());
  };

  const getDialog = (): HTMLElement => screen.getByRole('dialog', { name: 'New chat' });

  beforeEach(() => {
    chatGatewayMock = ChatMocks.chatGateway();
    notifierMock = NotificationMocks.notifier();
  });

  describe('successful creation', () => {
    it('should close the dialog', async () => {
      const user = userEvent.setup();
      chatGatewayMock.chats.mockReturnValue(of([]));
      chatGatewayMock.createChat.mockReturnValue(of({ id: 1 }));
      await renderHost();
      await openDialog();

      await user.type(within(getDialog()).getByLabelText('Title'), 'typedTitle');
      await user.click(within(getDialog()).getByRole('button', { name: 'Create' }));

      await waitFor(() => expect(screen.queryByLabelText('Title')).not.toBeInTheDocument());
    });
  });

  describe('opening without submitting', () => {
    it('should not call createChat', async () => {
      await renderHost();
      await openDialog();

      expect(chatGatewayMock.createChat).not.toHaveBeenCalled();
    });
  });

  describe('empty title', () => {
    // Кнопка выключена, пользовательского пути к submit нет: проверяем защиту.
    it('should not call createChat and should not close the dialog', async () => {
      await renderHost();
      await openDialog();

      fireEvent.submit(getDialog().querySelector('form') as HTMLFormElement);

      expect(chatGatewayMock.createChat).not.toHaveBeenCalled();
      expect(screen.getByLabelText('Title')).toBeInTheDocument();
    });
  });

  describe('flow lifetime', () => {
    beforeEach(() => {
      chatGatewayMock.createChat.mockImplementation(() =>
        throwError(() => new ApplicationError('Mock error')),
      );
    });

    it('should show an empty form without an error when reopened after a failed creation', async () => {
      const user = userEvent.setup();
      await renderHost();
      const failedDialogRef = await openDialog();

      await user.type(within(getDialog()).getByLabelText('Title'), 'typedTitle');
      await user.click(within(getDialog()).getByRole('button', { name: 'Create' }));

      expect(notifierMock.error).toHaveBeenCalledWith('Failed to create chat', 'Mock error');
      expect(getDialog().querySelector('.create-chat-form__error')).toBeNull();

      await closeDialog(failedDialogRef);
      await openDialog();

      expect(within(getDialog()).getByLabelText('Title')).toHaveValue('');
      expect(getDialog().querySelector('.create-chat-form__error')).toBeNull();
    });

    it('should keep the reopened form usable while the previous creation has not answered yet', async () => {
      chatGatewayMock.createChat.mockReturnValue(new Subject<CreateChatResult>());
      const user = userEvent.setup();
      await renderHost();
      const firstDialogRef = await openDialog();

      await user.type(within(getDialog()).getByLabelText('Title'), 'typedTitle');
      await user.click(within(getDialog()).getByRole('button', { name: 'Create' }));

      await closeDialog(firstDialogRef);
      await openDialog();

      await user.type(within(getDialog()).getByLabelText('Title'), 'anotherTitle');

      expect(within(getDialog()).getByLabelText('Title')).toBeEnabled();
      expect(within(getDialog()).getByRole('button', { name: 'Create' })).toBeEnabled();
    });

    it('should not cancel the creation when the dialog is closed before the gateway answers', async () => {
      const createChat$ = new Subject<CreateChatResult>();
      chatGatewayMock.createChat.mockReturnValue(createChat$);
      const user = userEvent.setup();
      await renderHost();
      const dialogRef = await openDialog();

      await user.type(within(getDialog()).getByLabelText('Title'), 'typedTitle');
      await user.click(within(getDialog()).getByRole('button', { name: 'Create' }));

      await closeDialog(dialogRef);

      createChat$.error(new ApplicationError('Mock error'));

      expect(notifierMock.error).toHaveBeenCalledWith('Failed to create chat', 'Mock error');
    });
  });
});

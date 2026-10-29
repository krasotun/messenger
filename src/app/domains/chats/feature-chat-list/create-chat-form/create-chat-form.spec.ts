import { outputBinding } from '@angular/core';
import { fireEvent, render, screen } from '@testing-library/angular/zoneless';
import { userEvent } from '@testing-library/user-event';
import { of, Subject } from 'rxjs';

import { CreateChatForm } from './create-chat-form';

import { CHAT_GATEWAY, CreateChatResult } from '@domains/chats/data/chat-gateway';
import { ChatListStore } from '@domains/chats/data/chat-list-store';
import { ChatMocks } from '@domains/chats/testing';
import { NOTIFIER } from '@shared/notifications';
import { NotificationMocks } from '@shared/notifications/testing';

const requiredFieldError = 'This field is required';

describe('CreateChatForm', () => {
  let chatGatewayMock: ReturnType<typeof ChatMocks.chatGateway>;

  const renderForm = async () => {
    const chatCreated = vi.fn();

    const result = await render(CreateChatForm, {
      bindings: [outputBinding('chatCreated', chatCreated)],
      providers: [
        ChatListStore,
        { provide: CHAT_GATEWAY, useValue: chatGatewayMock },
        { provide: NOTIFIER, useValue: NotificationMocks.notifier() },
      ],
      waitForStableOnRender: true,
    });

    return { ...result, chatCreated };
  };

  const getTitleField = (): HTMLElement => screen.getByLabelText('Title');

  const getSubmitButton = (): HTMLElement => screen.getByRole('button', { name: 'Create' });

  beforeEach(() => {
    chatGatewayMock = ChatMocks.chatGateway();
  });

  it('should create', async () => {
    const { fixture } = await renderForm();

    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('opened form', () => {
    it('should show an empty title field', async () => {
      await renderForm();

      expect(getTitleField()).toHaveValue('');
    });
  });

  describe('submit with an empty title', () => {
    // Кнопка выключена, пользовательского пути к submit нет: проверяем защиту.
    it('should not call createChat', async () => {
      const { container } = await renderForm();

      fireEvent.submit(container.querySelector('form') as HTMLFormElement);

      expect(chatGatewayMock.createChat).not.toHaveBeenCalled();
    });
  });

  describe('submit button availability', () => {
    it('should disable the submit button when the title is empty', async () => {
      await renderForm();

      expect(getSubmitButton()).toBeDisabled();
    });

    it('should not show a field error on an untouched form', async () => {
      await renderForm();

      expect(screen.queryByText(requiredFieldError)).not.toBeInTheDocument();
      expect(getSubmitButton()).toBeDisabled();
    });

    it('should show a field error after the field loses focus while it stays empty', async () => {
      const user = userEvent.setup();
      await renderForm();

      await user.click(getTitleField());
      await user.tab();

      expect(screen.getByText(requiredFieldError)).toBeInTheDocument();
      expect(getSubmitButton()).toBeDisabled();
    });

    it('should disable the submit button again after the title is cleared', async () => {
      const user = userEvent.setup();
      await renderForm();

      await user.type(getTitleField(), 'Analytics Q3');
      expect(getSubmitButton()).toBeEnabled();

      await user.clear(getTitleField());

      expect(getSubmitButton()).toBeDisabled();
    });
  });

  describe('valid submit', () => {
    it('should call createChat with the entered title', async () => {
      const user = userEvent.setup();
      chatGatewayMock.createChat.mockReturnValue(new Subject<CreateChatResult>());
      await renderForm();

      await user.type(getTitleField(), 'Analytics Q3');
      await user.click(getSubmitButton());

      expect(chatGatewayMock.createChat).toHaveBeenCalledOnce();
      expect(chatGatewayMock.createChat).toHaveBeenCalledWith({ title: 'Analytics Q3' });
    });
  });

  describe('submitting state', () => {
    it('should disable submit button and the title control', async () => {
      const user = userEvent.setup();
      chatGatewayMock.createChat.mockReturnValue(new Subject<CreateChatResult>());
      await renderForm();

      await user.type(getTitleField(), 'Analytics Q3');
      await user.click(getSubmitButton());

      expect(getSubmitButton()).toBeDisabled();
      expect(getTitleField()).toBeDisabled();
    });
  });

  describe('error state', () => {
    it('should not render a submit error in the form', async () => {
      const { container } = await renderForm();

      expect(container.querySelector('.create-chat-form__error')).toBeNull();
    });
  });

  describe('success state', () => {
    it('should emit chatCreated when the store reports success, without a manual application tick', async () => {
      const user = userEvent.setup();
      chatGatewayMock.chats.mockReturnValue(of([]));
      chatGatewayMock.createChat.mockReturnValue(of({ id: 1 }));
      const { chatCreated } = await renderForm();

      await user.type(getTitleField(), 'Analytics Q3');
      await user.click(getSubmitButton());

      expect(chatCreated).toHaveBeenCalledOnce();
    });
  });
});

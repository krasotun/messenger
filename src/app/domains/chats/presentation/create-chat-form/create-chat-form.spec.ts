import { outputBinding } from '@angular/core';
import { fireEvent, render, screen } from '@testing-library/angular/zoneless';
import { userEvent } from '@testing-library/user-event';

import { CreateChatService } from '../../application/create-chat/create-chat.service';

import { CreateChatForm } from './create-chat-form';

import { ChatMocks } from '@domains/chats/testing';

const requiredFieldError = 'This field is required';

describe('CreateChatForm', () => {
  let createChatServiceMock: ReturnType<typeof ChatMocks.createChatService>;

  const renderForm = async () => {
    const chatCreated = vi.fn();

    const result = await render(CreateChatForm, {
      bindings: [outputBinding('chatCreated', chatCreated)],
      providers: [{ provide: CreateChatService, useValue: createChatServiceMock }],
      waitForStableOnRender: true,
    });

    return { ...result, chatCreated };
  };

  const getTitleField = (): HTMLElement => screen.getByLabelText('Title');

  const getSubmitButton = (): HTMLElement => screen.getByRole('button', { name: 'Create' });

  beforeEach(() => {
    createChatServiceMock = ChatMocks.createChatService();
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

      expect(createChatServiceMock.createChat).not.toHaveBeenCalled();
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
      await renderForm();

      await user.type(getTitleField(), 'Analytics Q3');
      await user.click(getSubmitButton());

      expect(createChatServiceMock.createChat).toHaveBeenCalledOnce();
      expect(createChatServiceMock.createChat).toHaveBeenCalledWith({ title: 'Analytics Q3' });
    });
  });

  describe('submitting state', () => {
    it('should disable submit button and the title control', async () => {
      const { fixture } = await renderForm();

      createChatServiceMock.isSubmitting.set(true);
      await fixture.whenStable();

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
    it('should emit chatCreated when the service reports success, without a manual application tick', async () => {
      const { chatCreated } = await renderForm();

      createChatServiceMock.succeeded$.next();

      expect(chatCreated).toHaveBeenCalledOnce();
    });
  });
});

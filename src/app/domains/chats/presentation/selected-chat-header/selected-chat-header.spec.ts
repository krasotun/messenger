import { Component, input, inputBinding, outputBinding } from '@angular/core';
import { render, screen, within } from '@testing-library/angular/zoneless';
import { userEvent } from '@testing-library/user-event';

import { SelectedChatHeader } from './selected-chat-header';

import { AddChatUserPanel } from '@domains/chats/presentation/add-chat-user-panel/add-chat-user-panel';
import { ChatMocks } from '@domains/chats/testing';

const chatMock = ChatMocks.chat({ id: 7, title: 'Analytics Q3' });

const chatUserMock = ChatMocks.chatUser({ name: 'Johnny' });

// Заглушка показывает chatId текстом: так тест проверяет, что панель
// получила выбранный чат, через видимый результат, а не через экземпляр.
@Component({
  selector: 'app-add-chat-user-panel',
  template: 'Add member panel for chat {{ chatId() }}',
})
class AddChatUserPanelStub {
  readonly chatId = input.required<number>();
}

const renderHeader = async (options: { isChatCreator?: boolean } = {}) => {
  const deleteRequested = vi.fn();
  const membersToggled = vi.fn();

  const { fixture } = await render(SelectedChatHeader, {
    bindings: [
      inputBinding('chat', () => chatMock),
      inputBinding('isChatCreator', () => options.isChatCreator ?? false),
      inputBinding('chatUsers', () => [chatUserMock]),
      outputBinding('deleteRequested', deleteRequested),
      outputBinding('membersToggled', membersToggled),
    ],
    importOverrides: [{ replace: AddChatUserPanel, with: AddChatUserPanelStub }],
  });

  return { fixture, deleteRequested, membersToggled };
};

describe('SelectedChatHeader', () => {
  it('should create', async () => {
    const { fixture } = await renderHeader();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show the chat title', async () => {
    await renderHeader();

    expect(screen.getByText('Analytics Q3')).toBeInTheDocument();
  });

  it('should pass chat users to users stack', async () => {
    await renderHeader();

    const membersButton = screen.getByRole('button', { name: 'Members' });

    expect(within(membersButton).getByRole('img', { name: 'Avatar Johnny' })).toBeInTheDocument();
  });

  describe('deleting the chat', () => {
    it('shows the delete action to the chat creator with an accessible name', async () => {
      await renderHeader({ isChatCreator: true });

      expect(screen.getByRole('button', { name: 'Delete chat' })).toBeInTheDocument();
    });

    // Поиск по имени здесь не пустой: тест выше закрепляет, что у кнопки
    // именно это имя, поэтому null означает отсутствие кнопки, а не опечатку.
    it('hides the delete action from other chat members', async () => {
      await renderHeader();

      expect(screen.queryByRole('button', { name: 'Delete chat' })).not.toBeInTheDocument();
    });

    it('should emit delete request when delete button clicked', async () => {
      const user = userEvent.setup();
      const { deleteRequested } = await renderHeader({ isChatCreator: true });

      await user.click(screen.getByRole('button', { name: 'Delete chat' }));

      expect(deleteRequested).toHaveBeenCalledOnce();
    });
  });

  it('emits membersToggled when the users stack button is clicked', async () => {
    const user = userEvent.setup();
    const { membersToggled } = await renderHeader();

    await user.click(screen.getByRole('button', { name: 'Members' }));

    expect(membersToggled).toHaveBeenCalledOnce();
  });

  it('opens the add member panel for the selected chat when Add member is clicked', async () => {
    const user = userEvent.setup();
    await renderHeader();

    await user.click(screen.getByRole('button', { name: '+ Add member' }));

    expect(await screen.findByText('Add member panel for chat 7')).toBeInTheDocument();
  });
});

import { inputBinding, outputBinding } from '@angular/core';
import { render, screen } from '@testing-library/angular/zoneless';
import { userEvent } from '@testing-library/user-event';

import { ChatUserRow } from './chat-user-row';

import { ChatMocks } from '@domains/chats/testing';

const chatUserMock = ChatMocks.chatUser({ id: 2, name: 'Johnny', avatar: '/avatar.png' });

const renderRow = async (options: { isCurrentUser?: boolean; canRemove?: boolean } = {}) => {
  const removeRequested = vi.fn();

  await render(ChatUserRow, {
    bindings: [
      inputBinding('user', () => chatUserMock),
      inputBinding('isCurrentUser', () => options.isCurrentUser ?? false),
      inputBinding('canRemove', () => options.canRemove ?? false),
      outputBinding('removeRequested', removeRequested),
    ],
  });

  return { removeRequested };
};

describe('ChatUserRow', () => {
  it("shows the chat user's avatar", async () => {
    await renderRow();

    expect(screen.getByRole('img', { name: 'Avatar Johnny' })).toHaveAttribute(
      'src',
      '/avatar.png',
    );
  });

  it('shows the chat user name', async () => {
    await renderRow();

    expect(screen.getByText('Johnny')).toBeInTheDocument();
  });

  it('marks the current user row with (you)', async () => {
    await renderRow({ isCurrentUser: true });

    expect(screen.getByText('(you)')).toBeInTheDocument();
  });

  it('does not mark another chat user row with (you)', async () => {
    await renderRow();

    expect(screen.queryByText('(you)')).not.toBeInTheDocument();
  });

  describe('removing a user from chat', () => {
    it('user can see remove button labelled with user name if they can remove users from chat', async () => {
      await renderRow({ canRemove: true });

      expect(screen.getByRole('button', { name: 'Remove Johnny' })).toBeInTheDocument();
    });

    it('user does not see remove button if they cannot remove users from chat', async () => {
      await renderRow();

      // Без имени: поиск по неверной подписи тоже вернул бы null, и тест прошел бы впустую.
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('click on button emits removeRequested', async () => {
      const user = userEvent.setup();
      const { removeRequested } = await renderRow({ canRemove: true });

      await user.click(screen.getByRole('button', { name: 'Remove Johnny' }));

      expect(removeRequested).toHaveBeenCalledOnce();
    });
  });
});

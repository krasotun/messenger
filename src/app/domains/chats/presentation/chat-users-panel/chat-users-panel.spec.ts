import { inputBinding, outputBinding } from '@angular/core';
import { render, screen, within } from '@testing-library/angular/zoneless';
import { userEvent } from '@testing-library/user-event';

import { ChatUsersPanel } from './chat-users-panel';

import { ChatMocks } from '@domains/chats/testing';

const currentUserMock = ChatMocks.chatUser({ id: 2, name: 'Johnny' });

const anotherUserMock = ChatMocks.chatUser({ id: 3, name: 'Billy' });

describe('ChatUsersPanel', () => {
  const renderPanel = async (options: { canRemoveChatUsers?: boolean } = {}) => {
    const closed = vi.fn();
    const removeRequested = vi.fn();

    await render(ChatUsersPanel, {
      bindings: [
        inputBinding('chatUsers', () => [currentUserMock, anotherUserMock]),
        inputBinding('currentUserId', () => currentUserMock.id),
        inputBinding('canRemoveChatUsers', () => options.canRemoveChatUsers ?? false),
        outputBinding('closed', closed),
        outputBinding('removeRequested', removeRequested),
      ],
    });

    return { closed, removeRequested };
  };

  const getRow = (name: string): HTMLElement => screen.getByText(name).closest('li') as HTMLElement;

  it('shows the chat user count in the Members · N title', async () => {
    await renderPanel();

    expect(screen.getByRole('heading', { name: 'Members · 2' })).toBeInTheDocument();
  });

  it('shows a row for each chat user', async () => {
    await renderPanel();

    const rows = screen.getAllByRole('listitem');

    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getByText('Johnny')).toBeInTheDocument();
    expect(within(rows[1]).getByText('Billy')).toBeInTheDocument();
  });

  it('marks the current user row', async () => {
    await renderPanel();

    expect(within(getRow('Johnny')).getByText('(you)')).toBeInTheDocument();
  });

  it('does not mark other chat user rows', async () => {
    await renderPanel();

    expect(within(getRow('Billy')).queryByText('(you)')).not.toBeInTheDocument();
  });

  it('emits closed when Close members is pressed', async () => {
    const user = userEvent.setup();
    const { closed } = await renderPanel();

    await user.click(screen.getByRole('button', { name: 'Close members' }));

    expect(closed).toHaveBeenCalledOnce();
  });

  it('offers removal for other chat user rows when removal is allowed', async () => {
    await renderPanel({ canRemoveChatUsers: true });

    expect(
      within(getRow('Billy')).getByRole('button', { name: 'Remove Billy' }),
    ).toBeInTheDocument();
  });

  it('does not offer removal for the current user row when removal is allowed', async () => {
    await renderPanel({ canRemoveChatUsers: true });

    expect(within(getRow('Johnny')).queryByRole('button')).not.toBeInTheDocument();
  });

  it('offers removal for no row when removal is not allowed', async () => {
    await renderPanel();

    expect(within(getRow('Johnny')).queryByRole('button')).not.toBeInTheDocument();
    expect(within(getRow('Billy')).queryByRole('button')).not.toBeInTheDocument();
  });

  it('emits removeRequested with the chat user when their row requests removal', async () => {
    const user = userEvent.setup();
    const { removeRequested } = await renderPanel({ canRemoveChatUsers: true });

    await user.click(screen.getByRole('button', { name: 'Remove Billy' }));

    expect(removeRequested).toHaveBeenCalledWith(anotherUserMock);
  });
});

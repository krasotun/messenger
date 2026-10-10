import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { inputBinding, outputBinding } from '@angular/core';
import { render, screen } from '@testing-library/angular/zoneless';
import { userEvent } from '@testing-library/user-event';

import { ChatUsersPanel } from './chat-users-panel';

import { ChatMocks, ChatUserRowHarness } from '@domains/chats/testing';

const currentUserMock = ChatMocks.chatUser({ id: 2, name: 'Johnny' });

const anotherUserMock = ChatMocks.chatUser({ id: 3, name: 'Billy' });

// Панель проверяется Testing Library, а строки участников - через
// ChatUserRowHarness: разметку строки спек панели не знает.
describe('ChatUsersPanel', () => {
  let loader: HarnessLoader;

  const renderPanel = async (options: { canRemoveChatUsers?: boolean } = {}) => {
    const closed = vi.fn();
    const removeRequested = vi.fn();

    const { fixture } = await render(ChatUsersPanel, {
      bindings: [
        inputBinding('chatUsers', () => [currentUserMock, anotherUserMock]),
        inputBinding('currentUserId', () => currentUserMock.id),
        inputBinding('canRemoveChatUsers', () => options.canRemoveChatUsers ?? false),
        outputBinding('closed', closed),
        outputBinding('removeRequested', removeRequested),
      ],
    });

    loader = TestbedHarnessEnvironment.loader(fixture);

    return { closed, removeRequested };
  };

  const getRow = (name: string): Promise<ChatUserRowHarness> =>
    loader.getHarness(ChatUserRowHarness.with({ name }));

  it('shows the chat user count in the Members · N title', async () => {
    await renderPanel();

    expect(screen.getByRole('heading', { name: 'Members · 2' })).toBeInTheDocument();
  });

  it('shows a row for each chat user', async () => {
    await renderPanel();

    const rows = await loader.getAllHarnesses(ChatUserRowHarness);

    expect(await Promise.all(rows.map((row) => row.getName()))).toEqual(['Johnny', 'Billy']);
  });

  it('marks the current user row', async () => {
    await renderPanel();

    expect(await (await getRow('Johnny')).isCurrentUser()).toBe(true);
  });

  it('does not mark other chat user rows', async () => {
    await renderPanel();

    expect(await (await getRow('Billy')).isCurrentUser()).toBe(false);
  });

  it('emits closed when Close members is pressed', async () => {
    const user = userEvent.setup();
    const { closed } = await renderPanel();

    await user.click(screen.getByRole('button', { name: 'Close members' }));

    expect(closed).toHaveBeenCalledOnce();
  });

  it('offers removal for other chat user rows when removal is allowed', async () => {
    await renderPanel({ canRemoveChatUsers: true });

    expect(await (await getRow('Billy')).canRemove()).toBe(true);
  });

  it('does not offer removal for the current user row when removal is allowed', async () => {
    await renderPanel({ canRemoveChatUsers: true });

    expect(await (await getRow('Johnny')).canRemove()).toBe(false);
  });

  it('offers removal for no row when removal is not allowed', async () => {
    await renderPanel();

    const rows = await loader.getAllHarnesses(ChatUserRowHarness);

    expect(await Promise.all(rows.map((row) => row.canRemove()))).toEqual([false, false]);
  });

  it('emits removeRequested with the chat user when their row requests removal', async () => {
    const { removeRequested } = await renderPanel({ canRemoveChatUsers: true });

    await (await getRow('Billy')).remove();

    expect(removeRequested).toHaveBeenCalledWith(anotherUserMock);
  });
});

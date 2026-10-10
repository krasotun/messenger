import { inputBinding } from '@angular/core';
import { render, screen } from '@testing-library/angular/zoneless';
import { userEvent } from '@testing-library/user-event';

import { ChatUser } from '../../application/chat-user.type';

import { ChatUserStack } from './chat-user-stack';

import { ChatMocks } from '@domains/chats/testing';

const buildUsers = (count: number): ChatUser[] => {
  return Array.from({ length: count }, (_, index) =>
    ChatMocks.chatUser({ id: index + 1, name: `User ${index + 1}` }),
  );
};

describe('ChatUserStack', () => {
  const renderStack = (users: ChatUser[]) =>
    render(ChatUserStack, { bindings: [inputBinding('users', () => users)] });

  it('should create', async () => {
    const { fixture } = await renderStack([]);

    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('when members fit', () => {
    it('should show avatars for all members and no rest count', async () => {
      await renderStack(buildUsers(3));

      expect(screen.getAllByRole('img')).toHaveLength(3);
      expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
    });
  });

  describe('when there are more members than fit', () => {
    it('should show a limited number of avatars and the rest count', async () => {
      await renderStack(buildUsers(6));

      expect(screen.getAllByRole('img')).toHaveLength(4);
      expect(screen.getByText('+2')).toBeInTheDocument();
    });

    it('should not react to a click on the rest count', async () => {
      const user = userEvent.setup();
      await renderStack(buildUsers(6));

      const restCount = screen.getByText('+2');

      expect(restCount).not.toHaveRole('button');
      await expect(user.click(restCount)).resolves.toBeUndefined();
    });
  });
});

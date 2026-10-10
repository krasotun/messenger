import { inputBinding } from '@angular/core';
import { render, screen } from '@testing-library/angular/zoneless';

import { Chat } from '../../application/chat.type';

import { ChatListItem } from './chat-list-item';

import { ChatMocks } from '@domains/chats/testing';

const chatMock = ChatMocks.chat({
  title: 'Analytics Q3',
  avatar: 'https://mock.host/resources/path/to/chat-avatar.png',
  unreadCount: 3,
  lastMessage: {
    authorName: 'John',
    content: 'the report is ready',
  },
});

describe('ChatListItem', () => {
  const renderItem = (chat: Chat = chatMock) =>
    render(ChatListItem, { bindings: [inputBinding('chat', () => chat)] });

  it('should create', async () => {
    const { fixture } = await renderItem();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show chat title', async () => {
    await renderItem();

    expect(screen.getByText('Analytics Q3')).toBeInTheDocument();
  });

  it('should show chat avatar', async () => {
    await renderItem();

    expect(screen.getByRole('img', { name: 'Avatar Analytics Q3' })).toHaveAttribute(
      'src',
      chatMock.avatar,
    );
  });

  it('should show last message with its author', async () => {
    await renderItem();

    expect(screen.getByText('John: the report is ready')).toBeInTheDocument();
  });

  it('should show unread count', async () => {
    await renderItem();

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  describe('when the chat has no last message', () => {
    beforeEach(async () => {
      await renderItem({ ...chatMock, lastMessage: null });
    });

    it('should show a placeholder instead of the last message', () => {
      expect(screen.getByText('No messages yet')).toBeInTheDocument();
    });

    it('should still show the title and the avatar', () => {
      expect(screen.getByText('Analytics Q3')).toBeInTheDocument();
      expect(screen.getByRole('img', { name: 'Avatar Analytics Q3' })).toBeInTheDocument();
    });
  });

  describe('when the chat has no unread messages', () => {
    it('should not show the unread count', async () => {
      await renderItem({ ...chatMock, unreadCount: 0 });

      expect(screen.queryByText('0')).not.toBeInTheDocument();
      expect(screen.queryByText('3')).not.toBeInTheDocument();
    });
  });
});

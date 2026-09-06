import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Chat } from '../../application/chat.type';

import { ChatListItem } from './chat-list-item';

const chatMock: Chat = {
  id: 1,
  title: 'Analytics Q3',
  avatar: 'https://mock.host/resources/path/to/chat-avatar.png',
  unreadCount: 3,
  lastMessage: {
    authorName: 'John',
    content: 'the report is ready',
  },
};

describe('ChatListItem', () => {
  let component: ChatListItem;
  let fixture: ComponentFixture<ChatListItem>;

  const setChat = async (chat: Chat): Promise<void> => {
    fixture.componentRef.setInput('chat', chat);
    await fixture.whenStable();
    fixture.detectChanges();
  };

  const getText = (selector: string): string => {
    return fixture.nativeElement.querySelector(selector)?.textContent?.trim() ?? '';
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatListItem],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatListItem);
    component = fixture.componentInstance;

    await setChat(chatMock);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show chat title', () => {
    expect(getText('.chat-list-item__title')).toBe('Analytics Q3');
  });

  it('should show chat avatar', () => {
    const imageEl: HTMLImageElement = fixture.nativeElement.querySelector('.avatar__image');

    expect(imageEl.src).toBe(chatMock.avatar);
  });

  it('should show last message with its author', () => {
    expect(getText('.chat-list-item__last-message')).toBe('John: the report is ready');
  });

  it('should show unread count', () => {
    expect(getText('.chat-list-item__unread-count')).toBe('3');
  });

  describe('when the chat has no last message', () => {
    beforeEach(async () => {
      await setChat({ ...chatMock, lastMessage: null });
    });

    it('should show a placeholder instead of the last message', () => {
      expect(getText('.chat-list-item__last-message')).toBe('No messages yet');
    });

    it('should still show the title and the avatar', () => {
      expect(getText('.chat-list-item__title')).toBe('Analytics Q3');
      expect(fixture.nativeElement.querySelector('.avatar')).not.toBeNull();
    });
  });

  describe('when the chat has no unread messages', () => {
    beforeEach(async () => {
      await setChat({ ...chatMock, unreadCount: 0 });
    });

    it('should not show the unread count', () => {
      expect(fixture.nativeElement.querySelector('.chat-list-item__unread-count')).toBeNull();
    });
  });
});

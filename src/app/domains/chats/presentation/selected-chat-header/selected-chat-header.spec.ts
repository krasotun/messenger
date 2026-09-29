import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ChatUser } from '../../application/chat-user.type';
import { Chat } from '../../application/chat.type';

import { SelectedChatHeader } from './selected-chat-header';

import { ChatUserStack } from '@domains/chats/presentation/chat-user-stack/chat-user-stack';

const chatMock: Chat = {
  id: 1,
  title: 'Analytics Q3',
  avatar: null,
  unreadCount: 0,
  createdBy: 1,
  lastMessage: null,
};

const chatUserMock: ChatUser = {
  id: 2,
  name: 'Johnny',
  avatar: null,
};

describe('SelectedChatHeader', () => {
  let fixture: ComponentFixture<SelectedChatHeader>;

  const createComponent = async (options: { isChatCreator?: boolean } = {}): Promise<void> => {
    const { isChatCreator } = options;

    fixture = TestBed.createComponent(SelectedChatHeader);

    fixture.componentRef.setInput('chat', chatMock);
    fixture.componentRef.setInput('isChatCreator', isChatCreator ?? false);
    fixture.componentRef.setInput('chatUsers', [chatUserMock]);

    await fixture.whenStable();
    fixture.detectChanges();
  };

  const getText = (): string => fixture.nativeElement.textContent;

  const getDeleteButton = (): HTMLButtonElement | null =>
    fixture.nativeElement.querySelector('.selected-chat-header__delete-button');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectedChatHeader],
    }).compileComponents();
  });

  it('should create', async () => {
    await createComponent();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show the chat title', async () => {
    await createComponent();

    expect(getText()).toContain('Analytics Q3');
  });

  it('should pass chat users to users stack', async () => {
    await createComponent();

    const usersStack: ChatUserStack | null =
      fixture.debugElement.query(By.directive(ChatUserStack))?.componentInstance ?? null;

    if (usersStack === null) {
      throw new Error('Users stack not found');
    }

    expect(usersStack.users()).toEqual([chatUserMock]);
  });

  describe('deleting the chat', () => {
    it('shows the delete action to the chat creator with an accessible name', async () => {
      await createComponent({ isChatCreator: true });

      const deleteButton = getDeleteButton();

      expect(deleteButton).not.toBeNull();
      expect(deleteButton?.getAttribute('aria-label')).toBe('Delete chat');
    });

    it('hides the delete action from other chat members', async () => {
      await createComponent();

      expect(getDeleteButton()).toBeNull();
    });

    it('should emit delete request when delete butoon clicked', async () => {
      await createComponent({ isChatCreator: true });

      const deleteRequestedSpy = vi.fn();

      const deleteButton = getDeleteButton();

      if (deleteButton === null) {
        throw new Error('No delete button found');
      }

      fixture.componentInstance.deleteRequested.subscribe(deleteRequestedSpy);

      deleteButton.click();

      expect(deleteRequestedSpy).toHaveBeenCalledOnce();
    });
  });
});

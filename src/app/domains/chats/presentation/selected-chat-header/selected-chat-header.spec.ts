import { Component, getDebugNode, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ChatUser } from '../../application/chat-user.type';
import { Chat } from '../../application/chat.type';

import { SelectedChatHeader } from './selected-chat-header';

import { AddChatUserPanel } from '@domains/chats/presentation/add-chat-user-panel/add-chat-user-panel';
import { ChatUserStack } from '@domains/chats/presentation/chat-user-stack/chat-user-stack';
import { Nullable } from '@shared/types';

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

@Component({
  selector: 'app-add-chat-user-panel',
  template: '',
})
class AddChatUserPanelStub {
  readonly chatId = input.required<number>();
}

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

  const getMembersButton = (): Nullable<HTMLButtonElement> =>
    fixture.nativeElement.querySelector('.selected-chat-header__members-button');

  const getAddUserButton = (): Nullable<HTMLButtonElement> =>
    fixture.nativeElement.querySelector('.selected-chat-header__add-user-button');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectedChatHeader],
    })
      .overrideComponent(SelectedChatHeader, {
        remove: {
          imports: [AddChatUserPanel],
        },
        add: {
          imports: [AddChatUserPanelStub],
        },
      })
      .compileComponents();
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

  it('emits membersToggled when the users stack button is clicked', async () => {
    await createComponent();

    const membersToggledSpy = vi.fn();

    const membersButton = getMembersButton();

    if (membersButton === null) {
      throw new Error('No members button found');
    }

    fixture.componentInstance.membersToggled.subscribe(membersToggledSpy);

    membersButton.click();

    expect(membersToggledSpy).toHaveBeenCalledOnce();
  });

  it('opens the add member panel for the selected chat when Add member is clicked', async () => {
    await createComponent();

    const addUserButton = getAddUserButton();

    if (addUserButton === null) {
      throw new Error('No user add button found');
    }

    addUserButton.click();

    await fixture.whenStable();

    const addUserPanel: Nullable<HTMLElement> = document.querySelector('app-add-chat-user-panel');

    if (addUserPanel === null) {
      throw new Error('No user panel found');
    }

    const panelChatId = getDebugNode(addUserPanel)?.componentInstance.chatId();

    expect(panelChatId).toBe(chatMock.id);
  });
});

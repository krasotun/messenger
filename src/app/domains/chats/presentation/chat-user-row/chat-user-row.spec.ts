import { inputBinding, outputBinding, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Mock } from 'vitest';

import { ChatUserRow } from './chat-user-row';

import { ChatUser } from '@domains/chats/application/chat-user.type';
import { Nullable } from '@shared/types';
import { Avatar } from '@shared/ui/avatar/avatar';

const chatUserMock = signal<ChatUser>({
  id: 2,
  name: 'Johnny',
  avatar: '/avatar.png',
});

const isCurrentUserMock = signal(false);

const canRemoveMock = signal(false);

describe('ChatUserRow', () => {
  let fixture: ComponentFixture<ChatUserRow>;
  let removeRequestedSpy: Mock<() => void>;

  const getRemoveButton = (): Nullable<HTMLButtonElement> =>
    fixture.nativeElement.querySelector('.chat-user-row__remove-user-button');

  beforeEach(async () => {
    removeRequestedSpy = vi.fn();

    isCurrentUserMock.set(false);
    canRemoveMock.set(false);

    await TestBed.configureTestingModule({
      imports: [ChatUserRow],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatUserRow, {
      bindings: [
        inputBinding('user', chatUserMock),
        inputBinding('isCurrentUser', isCurrentUserMock),
        inputBinding('canRemove', canRemoveMock),
        outputBinding('removeRequested', removeRequestedSpy),
      ],
    });
    await fixture.whenStable();
  });

  it("shows the chat user's avatar", () => {
    const userAvatar: Nullable<Avatar> =
      fixture.debugElement.query(By.directive(Avatar))?.componentInstance ?? null;

    if (userAvatar === null) {
      throw new Error('Avatar not found');
    }

    expect(userAvatar.imageUrl()).toBe(chatUserMock().avatar);
  });

  it('shows the chat user name', () => {
    const hostElement: HTMLElement = fixture.nativeElement;

    expect(hostElement.textContent).toContain(chatUserMock().name);
  });

  it('marks the current user row with (you)', async () => {
    isCurrentUserMock.set(true);

    await fixture.whenStable();

    const hostElement: HTMLElement = fixture.nativeElement;

    expect(hostElement.textContent).toContain('(you)');
  });

  it('does not mark another chat user row with (you)', () => {
    const hostElement: HTMLElement = fixture.nativeElement;

    expect(hostElement.textContent).not.toContain('(you)');
  });

  describe('removing a user from chat', () => {
    it('user can see remove button if he can remove users from chat', async () => {
      canRemoveMock.set(true);

      await fixture.whenStable();

      expect(getRemoveButton()).not.toBe(null);
    });

    it('remove button has aria label with user name and remove word', async () => {
      canRemoveMock.set(true);

      await fixture.whenStable();
      const removeButton = getRemoveButton();

      if (removeButton === null) {
        throw new Error('No remove button found');
      }

      expect(removeButton?.getAttribute('aria-label')).toBe('Remove Johnny');
    });

    it('user not see remove button if he cannnot remove users from chat', () => {
      expect(getRemoveButton()).toBe(null);
    });

    it('click on button emits removeRequested', async () => {
      canRemoveMock.set(true);

      await fixture.whenStable();

      const removeButton = getRemoveButton();

      if (removeButton === null) {
        throw new Error('No remove button found');
      }

      removeButton.click();

      expect(removeRequestedSpy).toHaveBeenCalledOnce();
    });
  });
});

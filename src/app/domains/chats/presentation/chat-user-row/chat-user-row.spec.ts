import { inputBinding, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

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

describe('ChatUserRow', () => {
  let fixture: ComponentFixture<ChatUserRow>;

  beforeEach(async () => {
    isCurrentUserMock.set(false);

    await TestBed.configureTestingModule({
      imports: [ChatUserRow],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatUserRow, {
      bindings: [
        inputBinding('user', chatUserMock),
        inputBinding('isCurrentUser', isCurrentUserMock),
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
});

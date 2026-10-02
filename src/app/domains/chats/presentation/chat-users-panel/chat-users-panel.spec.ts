import { inputBinding, outputBinding, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Mock } from 'vitest';

import { ChatUsersPanel } from './chat-users-panel';

import { ChatUser } from '@domains/chats/application/chat-user.type';
import { ChatUserRow } from '@domains/chats/presentation/chat-user-row/chat-user-row';
import { Nullable } from '@shared/types';

const currentUserMock: ChatUser = {
  id: 2,
  name: 'Johnny',
  avatar: null,
};

const anotherUserMock: ChatUser = {
  id: 3,
  name: 'Billy',
  avatar: null,
};

const chatUsersMock = signal([currentUserMock, anotherUserMock]);

const currentUserIdMock = signal(currentUserMock.id);

const getRows = (fixture: ComponentFixture<ChatUsersPanel>): ChatUserRow[] =>
  fixture.debugElement
    .queryAll(By.directive(ChatUserRow))
    .map(({ componentInstance }) => componentInstance);

describe('ChatUsersPanel', () => {
  let fixture: ComponentFixture<ChatUsersPanel>;
  let closedSpy: Mock<() => void>;

  beforeEach(async () => {
    closedSpy = vi.fn();

    await TestBed.configureTestingModule({
      imports: [ChatUsersPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatUsersPanel, {
      bindings: [
        inputBinding('chatUsers', chatUsersMock),
        inputBinding('currentUserId', currentUserIdMock),
        outputBinding('closed', closedSpy),
      ],
    });
    await fixture.whenStable();
  });

  it('shows the chat user count in the Members · N title', () => {
    const host: HTMLElement = fixture.nativeElement;

    const title = 'Members · 2';

    expect(host.textContent).toContain(title);
  });

  it('shows a row for each chat user', () => {
    const usersInRows = getRows(fixture).map((row) => row.user());

    expect(usersInRows).toEqual(chatUsersMock());
  });

  it('marks the current user row', () => {
    const rows = getRows(fixture);

    const currentUserRow = rows.find((userInRow) => userInRow.user().id === currentUserIdMock());

    if (currentUserRow === undefined) {
      throw new Error('No current user found');
    }

    expect(currentUserRow.isCurrentUser()).toBe(true);
  });
  it('does not mark other chat user rows', () => {
    const rows = getRows(fixture);

    const marks = rows
      .filter((row) => row.user().id !== currentUserIdMock())
      .map((row) => row.isCurrentUser());

    expect(marks).toEqual([false]);
  });

  it('emits closed when Close members is pressed', () => {
    const closeButton: Nullable<HTMLButtonElement> = fixture.nativeElement.querySelector(
      'button[aria-label="Close members"]',
    );

    if (closeButton === null) {
      throw new Error('No close button found');
    }

    closeButton.click();

    expect(closedSpy).toHaveBeenCalledOnce();
  });
});

import { inputBinding, outputBinding, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Mock } from 'vitest';

import { ChatUsersPanel } from './chat-users-panel';

import { ChatUser } from '@domains/chats/application/chat-user.type';
import { ChatUserRow } from '@domains/chats/presentation/chat-user-row/chat-user-row';
import { ChatMocks } from '@domains/chats/testing';
import { Nullable } from '@shared/types';

const currentUserMock = ChatMocks.chatUser({ id: 2 });

const anotherUserMock = ChatMocks.chatUser({ id: 3, name: 'Billy' });

const chatUsersMock = signal([currentUserMock, anotherUserMock]);

const currentUserIdMock = signal(currentUserMock.id);

const canRemoveChatUsersMock = signal(false);

const getRows = (fixture: ComponentFixture<ChatUsersPanel>): ChatUserRow[] =>
  fixture.debugElement
    .queryAll(By.directive(ChatUserRow))
    .map(({ componentInstance }) => componentInstance);

describe('ChatUsersPanel', () => {
  let fixture: ComponentFixture<ChatUsersPanel>;
  let closedSpy: Mock<() => void>;
  let removeRequestedSpy: Mock<(user: ChatUser) => void>;

  beforeEach(async () => {
    closedSpy = vi.fn();
    removeRequestedSpy = vi.fn();

    canRemoveChatUsersMock.set(false);

    await TestBed.configureTestingModule({
      imports: [ChatUsersPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatUsersPanel, {
      bindings: [
        inputBinding('chatUsers', chatUsersMock),
        inputBinding('currentUserId', currentUserIdMock),
        inputBinding('canRemoveChatUsers', canRemoveChatUsersMock),
        outputBinding('closed', closedSpy),
        outputBinding('removeRequested', removeRequestedSpy),
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
  it('offers removal for other chat user rows when removal is allowed', async () => {
    canRemoveChatUsersMock.set(true);

    await fixture.whenStable();

    const rows = getRows(fixture);

    const marks = rows
      .filter((row) => row.user().id !== currentUserIdMock())
      .map((row) => row.canRemove());

    expect(marks).toEqual([true]);
  });

  it('does not offer removal for the current user row when removal is allowed', async () => {
    canRemoveChatUsersMock.set(true);

    await fixture.whenStable();

    const rows = getRows(fixture);

    const marks = rows
      .filter((row) => row.user().id === currentUserIdMock())
      .map((row) => row.canRemove());

    expect(marks).toEqual([false]);
  });

  it('offers removal for no row when removal is not allowed', async () => {
    const rows = getRows(fixture);

    const marks = rows.map((row) => row.canRemove());

    expect(marks).toEqual([false, false]);
  });

  it('emits removeRequested with the chat user when their row requests removal', async () => {
    const rows = fixture.debugElement.queryAll(By.directive(ChatUserRow));
    const userRowforExclude = rows.find((row) => row.componentInstance.user().name === 'Billy');

    if (userRowforExclude === undefined) {
      throw new Error('No user to exlude');
    }

    userRowforExclude.triggerEventHandler('removeRequested');

    expect(removeRequestedSpy).toHaveBeenCalledWith(anotherUserMock);
  });
});

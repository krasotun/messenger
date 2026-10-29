import { inputBinding, outputBinding } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { render, screen } from '@testing-library/angular/zoneless';
import { userEvent, UserEvent } from '@testing-library/user-event';
import { of, Subject } from 'rxjs';
import { Mock } from 'vitest';

import { AddChatUserPanel } from './add-chat-user-panel';

import { CHAT_GATEWAY } from '@domains/chats/data/chat-gateway';
import { ChatUsersStore } from '@domains/chats/data/chat-users-store';
import { ChatMocks } from '@domains/chats/testing';
import { SearchUsersResult, USER_GATEWAY } from '@domains/users';
import { UserMocks } from '@domains/users/testing';
import { NOTIFIER } from '@shared/notifications';
import { NotificationMocks } from '@shared/notifications/testing';

const userMock = UserMocks.user({ login: 'jane.roe', name: 'Janie' });

const debounceMs = 300;

describe('AddChatUserPanel', () => {
  let userGatewayMock: ReturnType<typeof UserMocks.userGateway>;
  let chatGatewayMock: ReturnType<typeof ChatMocks.chatGateway>;
  let fixture: ComponentFixture<AddChatUserPanel>;
  let userAdded: Mock<() => void>;
  let user: UserEvent;

  // Таймеры поддельные: user-event двигает их сам, а поиск ждет debounce.
  const search = async (text: string): Promise<void> => {
    await user.type(screen.getByRole('textbox', { name: 'Search users' }), text);
    vi.advanceTimersByTime(debounceMs);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    userGatewayMock = UserMocks.userGateway();
    vi.useFakeTimers();
    user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    chatGatewayMock = ChatMocks.chatGateway();
    chatGatewayMock.addChatUser.mockReturnValue(of({ userAdded: true }));
    chatGatewayMock.chatUsers.mockReturnValue(of([]));
    userAdded = vi.fn();

    ({ fixture } = await render(AddChatUserPanel, {
      bindings: [inputBinding('chatId', () => 1), outputBinding('userAdded', userAdded)],
      providers: [
        { provide: USER_GATEWAY, useValue: userGatewayMock },
        ChatUsersStore,
        { provide: CHAT_GATEWAY, useValue: chatGatewayMock },
        { provide: NOTIFIER, useValue: NotificationMocks.notifier() },
      ],
    }));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('empty field', () => {
    it('should show a hint to start typing a login', () => {
      expect(screen.getByText(/Start typing a login/)).toBeInTheDocument();
    });
  });

  describe('request in flight', () => {
    it('should keep the previous results visible while the new request is pending', async () => {
      userGatewayMock.searchUsers.mockReturnValueOnce(of({ users: [userMock] }));

      await search('ja');

      expect(screen.getByText('Janie')).toBeInTheDocument();

      userGatewayMock.searchUsers.mockReturnValueOnce(new Subject<SearchUsersResult>());

      await search('ne');

      expect(screen.getByText('Janie')).toBeInTheDocument();
      expect(screen.queryByText('No users found')).not.toBeInTheDocument();
    });
  });

  describe('found', () => {
    it('should show the found users', async () => {
      userGatewayMock.searchUsers.mockReturnValue(of({ users: [userMock] }));

      await search('jane');

      expect(screen.getByText('Janie')).toBeInTheDocument();
    });

    it('should add the clicked user to the given chat', async () => {
      userGatewayMock.searchUsers.mockReturnValue(of({ users: [userMock] }));

      await search('jane');
      await user.click(screen.getByRole('button', { name: /Janie/ }));

      expect(chatGatewayMock.addChatUser).toHaveBeenCalledWith({ chatId: 1, userId: 2 });
    });
  });

  describe('empty response', () => {
    it('should show that nobody was found, distinct from the not-started hint', async () => {
      userGatewayMock.searchUsers.mockReturnValue(of({ users: [] }));

      await search('nobody');

      expect(screen.getByText('No users found')).toBeInTheDocument();
      expect(screen.queryByText(/Start typing a login/)).not.toBeInTheDocument();
    });
  });

  describe('400 on add', () => {
    it('should not render a submit error and keep the panel open', async () => {
      userGatewayMock.searchUsers.mockReturnValue(of({ users: [userMock] }));

      await search('jane');

      expect(fixture.nativeElement.querySelector('.add-chat-user-panel__error')).toBeNull();
      expect(screen.getByText('Janie')).toBeInTheDocument();
    });
  });

  describe('successful add', () => {
    it('should emit userAdded when the user is added, without a manual application tick', async () => {
      userGatewayMock.searchUsers.mockReturnValue(of({ users: [userMock] }));

      await search('jane');
      await user.click(screen.getByRole('button', { name: /Janie/ }));

      expect(userAdded).toHaveBeenCalledOnce();
    });
  });
});

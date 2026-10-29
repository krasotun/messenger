import { inputBinding, outputBinding } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { render, screen } from '@testing-library/angular/zoneless';
import { userEvent, UserEvent } from '@testing-library/user-event';
import { of, Subject } from 'rxjs';
import { Mock } from 'vitest';

import { AddChatUserPanel } from './add-chat-user-panel';

import { CHAT_GATEWAY } from '@domains/chats/data/chat-gateway';
import { ChatMocks } from '@domains/chats/testing';
import { SearchUsersResult, SearchUsersService } from '@domains/identity-access';
import { IdentityMocks } from '@domains/identity-access/testing';
import { NOTIFIER } from '@shared/notifications';
import { NotificationMocks } from '@shared/notifications/testing';

const userMock = IdentityMocks.user({ login: 'jane.roe', name: 'Janie' });

const debounceMs = 300;

describe('AddChatUserPanel', () => {
  let searchUsersServiceMock: ReturnType<typeof IdentityMocks.searchUsersService>;
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
    searchUsersServiceMock = IdentityMocks.searchUsersService();
    vi.useFakeTimers();
    user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    chatGatewayMock = ChatMocks.chatGateway();
    chatGatewayMock.addChatUser.mockReturnValue(of({ userAdded: true }));
    chatGatewayMock.chatUsers.mockReturnValue(of([]));
    userAdded = vi.fn();

    ({ fixture } = await render(AddChatUserPanel, {
      bindings: [inputBinding('chatId', () => 1), outputBinding('userAdded', userAdded)],
      providers: [
        { provide: SearchUsersService, useValue: searchUsersServiceMock },
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
      searchUsersServiceMock.searchUsers.mockReturnValueOnce(of({ users: [userMock] }));

      await search('ja');

      expect(screen.getByText('Janie')).toBeInTheDocument();

      searchUsersServiceMock.searchUsers.mockReturnValueOnce(new Subject<SearchUsersResult>());

      await search('ne');

      expect(screen.getByText('Janie')).toBeInTheDocument();
      expect(screen.queryByText('No users found')).not.toBeInTheDocument();
    });
  });

  describe('found', () => {
    it('should show the found users', async () => {
      searchUsersServiceMock.searchUsers.mockReturnValue(of({ users: [userMock] }));

      await search('jane');

      expect(screen.getByText('Janie')).toBeInTheDocument();
    });

    it('should add the clicked user to the given chat', async () => {
      searchUsersServiceMock.searchUsers.mockReturnValue(of({ users: [userMock] }));

      await search('jane');
      await user.click(screen.getByRole('button', { name: /Janie/ }));

      expect(chatGatewayMock.addChatUser).toHaveBeenCalledWith({ chatId: 1, userId: 2 });
    });
  });

  describe('empty response', () => {
    it('should show that nobody was found, distinct from the not-started hint', async () => {
      searchUsersServiceMock.searchUsers.mockReturnValue(of({ users: [] }));

      await search('nobody');

      expect(screen.getByText('No users found')).toBeInTheDocument();
      expect(screen.queryByText(/Start typing a login/)).not.toBeInTheDocument();
    });
  });

  describe('400 on add', () => {
    it('should not render a submit error and keep the panel open', async () => {
      searchUsersServiceMock.searchUsers.mockReturnValue(of({ users: [userMock] }));

      await search('jane');

      expect(fixture.nativeElement.querySelector('.add-chat-user-panel__error')).toBeNull();
      expect(screen.getByText('Janie')).toBeInTheDocument();
    });
  });

  describe('successful add', () => {
    it('should emit userAdded when the user is added, without a manual application tick', async () => {
      searchUsersServiceMock.searchUsers.mockReturnValue(of({ users: [userMock] }));

      await search('jane');
      await user.click(screen.getByRole('button', { name: /Janie/ }));

      expect(userAdded).toHaveBeenCalledOnce();
    });
  });
});

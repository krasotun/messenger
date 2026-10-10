import { inputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { render, screen, within } from '@testing-library/angular/zoneless';
import { userEvent, UserEvent } from '@testing-library/user-event';
import { of, throwError } from 'rxjs';

import { ChatListService } from '../../application/chat-list/chat-list.service';
import { CHAT_GATEWAY } from '../../application/chat.gateway';
import { DeleteChatService } from '../../application/delete-chat/delete-chat.service';

import { SelectedChat } from './selected-chat';

import { RemoveChatUserService } from '@domains/chats/application/remove-chat-user/remove-chat-user.service';
import { ChatMocks } from '@domains/chats/testing';
import { CurrentSessionService, CurrentUser } from '@domains/identity-access';
import { IdentityMocks } from '@domains/identity-access/testing';
import { ApplicationError } from '@shared/errors';
import { Nullable } from '@shared/types';
import { ConfirmationService } from '@shared/ui/confirmation';

const firstChatMock = ChatMocks.chat({ id: 1, title: 'Analytics Q3' });
const secondChatMock = ChatMocks.chat({ id: 2, title: 'Analytics Q4' });

const firstChatUserMock = ChatMocks.chatUser({ id: 2, name: 'Johnny' });
const secondChatUserMock = ChatMocks.chatUser({ id: 3, name: 'Billie' });

const chatCreatorMock = IdentityMocks.currentUser({ id: 1 });

describe('SelectedChat', () => {
  let fixture: ComponentFixture<SelectedChat>;
  let chatId: WritableSignal<string>;
  let user: UserEvent;

  const currentUser = signal<Nullable<CurrentUser>>(chatCreatorMock);

  const currentSessionServiceMock = {
    currentUser: currentUser.asReadonly(),
  };

  const confirmationServiceMock = {
    confirm: vi.fn(),
  };

  let chatGatewayMock: ReturnType<typeof ChatMocks.chatGateway>;
  let deleteChatServiceMock: ReturnType<typeof ChatMocks.deleteChatService>;
  let removeChatUserServiceMock: ReturnType<typeof ChatMocks.removeChatUserService>;

  const routerMock = {
    navigateByUrl: vi.fn(),
  };

  // Сервисы удаления живут в providers компонента и подменяются через
  // overrideComponent; список чатов загружается до рендера, как это делает
  // страница чатов.
  const createComponent = async (
    initialChatId: string,
    options: { loadChats?: boolean } = {},
  ): Promise<void> => {
    chatId = signal(initialChatId);

    ({ fixture } = await render(SelectedChat, {
      bindings: [inputBinding('chatId', chatId)],
      providers: [
        { provide: CHAT_GATEWAY, useValue: chatGatewayMock },
        { provide: CurrentSessionService, useValue: currentSessionServiceMock },
        { provide: ConfirmationService, useValue: confirmationServiceMock },
        { provide: Router, useValue: routerMock },
      ],
      configureTestBed: (testBed) => {
        testBed.overrideComponent(SelectedChat, {
          set: {
            providers: [
              { provide: DeleteChatService, useValue: deleteChatServiceMock },
              { provide: RemoveChatUserService, useValue: removeChatUserServiceMock },
            ],
          },
        });

        if (options.loadChats ?? true) {
          TestBed.inject(ChatListService).loadChats();
        }
      },
      waitForStableOnRender: true,
    }));
  };

  const changeChat = async (nextChatId: string): Promise<void> => {
    chatId.set(nextChatId);
    await fixture.whenStable();
  };

  const queryMembersButton = (): Nullable<HTMLElement> =>
    screen.queryByRole('button', { name: 'Members' });

  const queryChatUsersPanel = (): Nullable<HTMLElement> =>
    screen.queryByRole('heading', { name: /^Members ·/ });

  const queryConversation = (): Nullable<HTMLElement> =>
    fixture.nativeElement.querySelector('.selected-chat__conversation');

  const requestDeletion = async (): Promise<void> => {
    await user.click(screen.getByRole('button', { name: 'Delete chat' }));
  };

  const requestMembersToggled = async (): Promise<void> => {
    await user.click(screen.getByRole('button', { name: 'Members' }));
  };

  const openChatUsersPanel = async (): Promise<HTMLElement> => {
    await requestMembersToggled();

    const chatUsersPanel = queryChatUsersPanel();

    if (chatUsersPanel === null) {
      throw new Error('Users panel not found');
    }

    return chatUsersPanel;
  };

  const requestChatUserRemoval = async (name: string): Promise<void> => {
    await user.click(screen.getByRole('button', { name: `Remove ${name}` }));
  };

  beforeEach(() => {
    user = userEvent.setup();

    chatGatewayMock = ChatMocks.chatGateway();
    chatGatewayMock.chats.mockReturnValue(of([firstChatMock, secondChatMock]));
    chatGatewayMock.chatUsers.mockReturnValue(of([firstChatUserMock]));

    currentUser.set(chatCreatorMock);

    confirmationServiceMock.confirm.mockReset();
    confirmationServiceMock.confirm.mockReturnValue(of(false));

    deleteChatServiceMock = ChatMocks.deleteChatService();
    removeChatUserServiceMock = ChatMocks.removeChatUserService();

    routerMock.navigateByUrl.mockReset();
  });

  describe('loading the chat users', () => {
    it('loads the members of the given chat', async () => {
      await createComponent('1');

      expect(chatGatewayMock.chatUsers).toHaveBeenCalledWith(1);
    });

    it('reloads the members when the chat changes', async () => {
      await createComponent('1');

      await changeChat('2');

      expect(chatGatewayMock.chatUsers).toHaveBeenLastCalledWith(2);
    });
  });

  describe('laying out the selected chat', () => {
    it('shows the header and the place for the conversation', async () => {
      await createComponent('1');

      expect(queryMembersButton()).toBeInTheDocument();
      expect(queryConversation()).not.toBeNull();
    });

    it('passes the chat and its members to the header', async () => {
      await createComponent('1');

      expect(screen.getByText('Analytics Q3')).toBeInTheDocument();
      expect(
        within(screen.getByRole('button', { name: 'Members' })).getByRole('img', {
          name: 'Avatar Johnny',
        }),
      ).toBeInTheDocument();
    });
  });

  describe('when the chat users fail to load', () => {
    beforeEach(async () => {
      chatGatewayMock.chatUsers.mockReturnValue(
        throwError(() => new ApplicationError('mockReason')),
      );

      await createComponent('999');
    });

    it('shows an application error', () => {
      expect(screen.getByText('mockReason')).toBeInTheDocument();
    });

    it('shows neither the header nor the place for the conversation', () => {
      expect(queryMembersButton()).not.toBeInTheDocument();
      expect(queryConversation()).toBeNull();
    });
  });

  describe('deciding who the chat creator is', () => {
    it('tells the header that the current user is the chat creator', async () => {
      await createComponent('1');

      expect(screen.getByRole('button', { name: 'Delete chat' })).toBeInTheDocument();
    });

    it('tells the header that other chat members are not the chat creator', async () => {
      currentUser.set({ ...chatCreatorMock, id: 999 });

      await createComponent('1');

      expect(screen.queryByRole('button', { name: 'Delete chat' })).not.toBeInTheDocument();
    });

    it('shows no header before the chat list has loaded', async () => {
      await createComponent('1', { loadChats: false });

      expect(queryMembersButton()).not.toBeInTheDocument();
    });
  });

  describe('deleting the chat', () => {
    it('asks for confirmation naming the chat and marking the action as dangerous', async () => {
      await createComponent('1');

      await requestDeletion();

      expect(confirmationServiceMock.confirm).toHaveBeenCalledWith({
        title: 'Delete chat',
        subject: 'Analytics Q3',
        message: "The chat and its messages disappear for every member. This can't be undone.",
        confirmLabel: 'Delete',
        isDangerous: true,
      });
    });

    it('does not delete the chat when the confirmation is refused', async () => {
      confirmationServiceMock.confirm.mockReturnValue(of(false));

      await createComponent('1');

      await requestDeletion();

      expect(deleteChatServiceMock.deleteChat).not.toHaveBeenCalled();
    });

    it('deletes the chat when the confirmation is accepted', async () => {
      confirmationServiceMock.confirm.mockReturnValue(of(true));

      await createComponent('1');

      await requestDeletion();

      expect(deleteChatServiceMock.deleteChat).toHaveBeenCalledWith({ chatId: 1 });
    });

    it('navigates to / when the chat is deleted', async () => {
      await createComponent('1');

      deleteChatServiceMock.succeeded$.next();

      expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/');
    });
  });

  describe('showing the chat members panel', () => {
    it('opens the closed members panel when the header emits membersToggled', async () => {
      await createComponent('1');

      await requestMembersToggled();

      expect(queryChatUsersPanel()).toBeInTheDocument();
    });

    describe('when the members panel is open', () => {
      beforeEach(async () => {
        await createComponent('1');

        await requestMembersToggled();
      });

      it('closes the open members panel when the header emits membersToggled', async () => {
        await requestMembersToggled();

        expect(queryChatUsersPanel()).not.toBeInTheDocument();
      });

      it('keeps the open members panel when the chat changes', async () => {
        await changeChat('2');

        expect(queryChatUsersPanel()).toBeInTheDocument();
      });

      it('shows the new members when the chat changes', async () => {
        chatGatewayMock.chatUsers.mockReturnValue(of([secondChatUserMock]));

        await changeChat('2');

        expect(within(screen.getByRole('list')).getByText('Billie')).toBeInTheDocument();
        expect(within(screen.getByRole('list')).queryByText('Johnny')).not.toBeInTheDocument();
      });

      it('closes the members panel when it emits closed', async () => {
        await user.click(screen.getByRole('button', { name: 'Close members' }));

        expect(queryChatUsersPanel()).not.toBeInTheDocument();
      });

      it('shows no members panel when the chat users fail to load', async () => {
        chatGatewayMock.chatUsers.mockReturnValue(
          throwError(() => new ApplicationError('mockReason')),
        );

        await changeChat('2');

        expect(queryChatUsersPanel()).not.toBeInTheDocument();
      });
    });
  });

  describe('removing a chat member', () => {
    beforeEach(() => {
      chatGatewayMock.chatUsers.mockReturnValue(of([firstChatUserMock, secondChatUserMock]));
    });

    it('lets the panel remove members when the current user is the chat creator', async () => {
      await createComponent('1');

      const chatUsersPanel = await openChatUsersPanel();

      expect(chatUsersPanel).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Remove Billie' })).toBeInTheDocument();
    });

    it('does not let the panel remove members when the current user is not the chat creator', async () => {
      currentUser.set({ ...chatCreatorMock, id: 999 });

      await createComponent('1');

      await openChatUsersPanel();

      expect(screen.queryAllByRole('button', { name: /^Remove / })).toHaveLength(0);
    });

    it('asks for confirmation naming the member and the chat without marking it as dangerous', async () => {
      await createComponent('1');

      await openChatUsersPanel();

      await requestChatUserRemoval('Billie');

      expect(confirmationServiceMock.confirm).toHaveBeenCalledWith({
        title: 'Remove member',
        subject: 'Billie',
        message: 'They leave "Analytics Q3" and can be added back later.',
        confirmLabel: 'Remove',
      });
    });

    it('does not remove the member when the confirmation is refused', async () => {
      await createComponent('1');

      await openChatUsersPanel();

      await requestChatUserRemoval('Billie');

      expect(removeChatUserServiceMock.removeChatUser).not.toHaveBeenCalled();
    });

    it('keeps the members panel open when the confirmation is refused', async () => {
      await createComponent('1');

      await openChatUsersPanel();

      await requestChatUserRemoval('Billie');

      expect(queryChatUsersPanel()).toBeInTheDocument();
    });

    it('removes the member from the chat when the confirmation is accepted', async () => {
      confirmationServiceMock.confirm.mockReturnValue(of(true));

      await createComponent('1');

      await openChatUsersPanel();

      await requestChatUserRemoval('Billie');

      expect(removeChatUserServiceMock.removeChatUser).toHaveBeenCalledWith({
        chatId: 1,
        userId: 3,
      });
    });

    it('keeps the members panel open after the member is removed', async () => {
      confirmationServiceMock.confirm.mockReturnValue(of(true));

      await createComponent('1');

      await openChatUsersPanel();

      await requestChatUserRemoval('Billie');

      removeChatUserServiceMock.succeeded$.next();

      await fixture.whenStable();

      expect(queryChatUsersPanel()).toBeInTheDocument();
    });
  });
});

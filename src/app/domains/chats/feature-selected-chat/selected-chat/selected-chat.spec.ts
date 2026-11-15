import { Component, input, inputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { render, screen, waitFor, within } from '@testing-library/angular/zoneless';
import { userEvent, UserEvent } from '@testing-library/user-event';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { of, throwError } from 'rxjs';

import { CHAT_GATEWAY } from '../../data/chat-gateway';
import { ChatListStore } from '../../data/chat-list-store';

import { SelectedChat } from './selected-chat';

import { ChatMocks } from '@domains/chats/testing';
import { CurrentSessionStore, CurrentUser } from '@domains/users';
import { UserMocks } from '@domains/users/testing';
import { ApplicationError } from '@shared/errors';
import { NOTIFIER } from '@shared/notifications';
import { NotificationMocks } from '@shared/notifications/testing';
import { Nullable } from '@shared/types';

const firstChatMock = ChatMocks.chat({ id: 1, title: 'Analytics Q3' });
const secondChatMock = ChatMocks.chat({ id: 2, title: 'Analytics Q4' });

const firstChatUserMock = ChatMocks.chatUser({ id: 2, name: 'Johnny' });
const secondChatUserMock = ChatMocks.chatUser({ id: 3, name: 'Billie' });

const chatCreatorMock = UserMocks.currentUser({ id: 1 });

@Component({
  selector: 'app-chats-page',
  template: '',
})
class ChatsPageStub {}

// Хост повторяет app.html: настоящий <p-confirmdialog> слушает тот же
// ConfirmationService, в который пишет фича.
@Component({
  selector: 'app-test-selected-chat-host',
  imports: [SelectedChat, ConfirmDialogModule],
  template: `<app-selected-chat [chatId]="chatId()" /><p-confirmdialog />`,
})
class TestSelectedChatHost {
  readonly chatId = input.required<string>();
}

describe('SelectedChat', () => {
  let fixture: ComponentFixture<TestSelectedChatHost>;
  let chatId: WritableSignal<string>;
  let user: UserEvent;

  const currentUser = signal<Nullable<CurrentUser>>(chatCreatorMock);

  const currentSessionStoreMock = {
    currentUser: currentUser.asReadonly(),
  };

  let chatGatewayMock: ReturnType<typeof ChatMocks.chatGateway>;

  // Список чатов загружается до рендера, как это делает страница чатов.
  const createComponent = async (
    initialChatId: string,
    options: { loadChats?: boolean } = {},
  ): Promise<void> => {
    chatId = signal(initialChatId);

    ({ fixture } = await render(TestSelectedChatHost, {
      bindings: [inputBinding('chatId', chatId)],
      providers: [
        ChatListStore,
        { provide: CHAT_GATEWAY, useValue: chatGatewayMock },
        { provide: NOTIFIER, useValue: NotificationMocks.notifier() },
        { provide: CurrentSessionStore, useValue: currentSessionStoreMock },
        ConfirmationService,
        provideRouter([
          { path: '', component: ChatsPageStub },
          { path: ':chatId', component: ChatsPageStub },
        ]),
      ],
      configureTestBed: () => {
        if (options.loadChats ?? true) {
          TestBed.inject(ChatListStore).loadChats();
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
    chatGatewayMock.deleteChat.mockReturnValue(of(undefined));
    chatGatewayMock.removeChatUser.mockReturnValue(of(undefined));

    currentUser.set(chatCreatorMock);
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
    it('asks for confirmation naming the chat', async () => {
      await createComponent('1');

      await requestDeletion();

      const dialog = await screen.findByRole('alertdialog', { name: 'Delete chat' });

      expect(within(dialog).getByText(/Analytics Q3/)).toBeInTheDocument();
      expect(within(dialog).getByText(/can't be undone/)).toBeInTheDocument();
    });

    it('styles the accept button as dangerous', async () => {
      await createComponent('1');

      await requestDeletion();

      expect(await screen.findByRole('button', { name: 'Delete' })).toHaveClass('p-button-danger');
    });

    it('deletes the chat when the person confirms', async () => {
      await createComponent('1');

      await requestDeletion();
      await user.click(await screen.findByRole('button', { name: 'Delete' }));

      expect(chatGatewayMock.deleteChat).toHaveBeenCalledWith({ chatId: 1 });
    });

    it('does not delete the chat when the person declines', async () => {
      await createComponent('1');

      await requestDeletion();
      await user.click(await screen.findByRole('button', { name: 'Cancel' }));

      expect(chatGatewayMock.deleteChat).not.toHaveBeenCalled();
    });

    it('does not delete the chat when the dialog is closed with Escape', async () => {
      await createComponent('1');

      await requestDeletion();
      await screen.findByRole('alertdialog', { name: 'Delete chat' });
      await user.keyboard('{Escape}');

      await waitFor(() =>
        expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument(),
      );
      expect(chatGatewayMock.deleteChat).not.toHaveBeenCalled();
    });

    it('does not delete the chat when the dialog is closed with its close button', async () => {
      await createComponent('1');

      await requestDeletion();
      // Кнопка закрытия кита не имеет доступного имени, поэтому ищем по классу кита.
      const dialog = await screen.findByRole('alertdialog', { name: 'Delete chat' });
      await user.click(dialog.querySelector<HTMLElement>('.p-dialog-close-button')!);

      await waitFor(() =>
        expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument(),
      );
      expect(chatGatewayMock.deleteChat).not.toHaveBeenCalled();
    });

    it('asks again after the dialog was closed without a choice and deletes once on accept', async () => {
      await createComponent('1');

      await requestDeletion();
      await screen.findByRole('alertdialog', { name: 'Delete chat' });
      await user.keyboard('{Escape}');
      await waitFor(() =>
        expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument(),
      );

      await requestDeletion();
      await user.click(await screen.findByRole('button', { name: 'Delete' }));

      expect(chatGatewayMock.deleteChat).toHaveBeenCalledTimes(1);
    });

    it('navigates to / when the chat is deleted', async () => {
      await createComponent('1');
      // Выбранный чат открыт по своему адресу, как на странице чатов.
      await TestBed.inject(Router).navigateByUrl('/1');

      await requestDeletion();
      await user.click(await screen.findByRole('button', { name: 'Delete' }));
      await fixture.whenStable();

      expect(TestBed.inject(Router).url).toBe('/');
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

    it('asks for confirmation naming the member and the chat', async () => {
      await createComponent('1');

      await openChatUsersPanel();
      await requestChatUserRemoval('Billie');

      const dialog = await screen.findByRole('alertdialog', { name: 'Remove member' });

      expect(within(dialog).getByText(/Billie/)).toBeInTheDocument();
      expect(within(dialog).getByText(/Analytics Q3/)).toBeInTheDocument();
    });

    it('styles the accept button as a regular action', async () => {
      await createComponent('1');

      await openChatUsersPanel();
      await requestChatUserRemoval('Billie');

      expect(await screen.findByRole('button', { name: 'Remove' })).not.toHaveClass(
        'p-button-danger',
      );
    });

    it('does not remove the member when the person declines', async () => {
      await createComponent('1');

      await openChatUsersPanel();
      await requestChatUserRemoval('Billie');
      await user.click(await screen.findByRole('button', { name: 'Cancel' }));

      expect(chatGatewayMock.removeChatUser).not.toHaveBeenCalled();
    });

    it('does not remove the member when the dialog is closed without a choice', async () => {
      await createComponent('1');

      await openChatUsersPanel();
      await requestChatUserRemoval('Billie');
      await screen.findByRole('alertdialog', { name: 'Remove member' });
      await user.keyboard('{Escape}');

      await waitFor(() =>
        expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument(),
      );
      expect(chatGatewayMock.removeChatUser).not.toHaveBeenCalled();
    });

    it('keeps the members panel open when the person declines', async () => {
      await createComponent('1');

      await openChatUsersPanel();
      await requestChatUserRemoval('Billie');
      await user.click(await screen.findByRole('button', { name: 'Cancel' }));

      expect(queryChatUsersPanel()).toBeInTheDocument();
    });

    it('removes the member from the chat when the person confirms', async () => {
      await createComponent('1');

      await openChatUsersPanel();
      await requestChatUserRemoval('Billie');
      await user.click(await screen.findByRole('button', { name: 'Remove' }));

      expect(chatGatewayMock.removeChatUser).toHaveBeenCalledWith({
        chatId: 1,
        userId: 3,
      });
    });

    it('keeps the members panel open after the member is removed', async () => {
      await createComponent('1');

      await openChatUsersPanel();
      await requestChatUserRemoval('Billie');
      await user.click(await screen.findByRole('button', { name: 'Remove' }));

      expect(queryChatUsersPanel()).toBeInTheDocument();
    });
  });
});

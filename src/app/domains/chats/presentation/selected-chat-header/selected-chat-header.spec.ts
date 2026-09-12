import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';

import { ChatListService } from '../../application/chat-list/chat-list.service';
import { ChatUser } from '../../application/chat-user.type';
import { CHAT_GATEWAY } from '../../application/chat.gateway';
import { Chat } from '../../application/chat.type';
import { DeleteChatService } from '../../application/delete-chat/delete-chat.service';

import { SelectedChatHeader } from './selected-chat-header';

import { CurrentSessionService, CurrentUser } from '@domains/identity-access';
import { ApplicationError } from '@shared/errors';
import { Nullable } from '@shared/types';
import { ConfirmationService } from '@shared/ui/confirmation';

const chatGatewayMock = {
  chats: vi.fn(),
  chatUsers: vi.fn(),
};

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

const chatCreatorMock: CurrentUser = {
  id: 1,
  avatar: null,
  displayName: null,
  email: 'creator@mock',
  firstName: 'Creator',
  login: 'creator',
  phone: 'phone',
  secondName: 'secondName',
};

describe('SelectedChatHeader', () => {
  let fixture: ComponentFixture<SelectedChatHeader>;

  const currentUser = signal<Nullable<CurrentUser>>(chatCreatorMock);

  const currentSessionServiceMock = {
    currentUser: currentUser.asReadonly(),
  };

  const confirmationServiceMock = {
    confirm: vi.fn(),
  };

  let deleteChatServiceMock: {
    deleteChat: ReturnType<typeof vi.fn>;
    succeeded$: Subject<void>;
  };

  const routerMock = {
    navigateByUrl: vi.fn(),
  };

  const createComponent = async (
    chatId: string,
    options: { loadChats?: boolean } = {},
  ): Promise<void> => {
    if (options.loadChats ?? true) {
      TestBed.inject(ChatListService).loadChats();
    }

    fixture = TestBed.createComponent(SelectedChatHeader);
    fixture.componentRef.setInput('chatId', chatId);
    await fixture.whenStable();
    fixture.detectChanges();
  };

  const getText = (): string => fixture.nativeElement.textContent;

  const getDeleteButton = (): HTMLButtonElement | null =>
    fixture.nativeElement.querySelector('.selected-chat-header__delete-button');

  beforeEach(async () => {
    chatGatewayMock.chats.mockReset();
    chatGatewayMock.chatUsers.mockReset();
    chatGatewayMock.chats.mockReturnValue(of([chatMock]));
    chatGatewayMock.chatUsers.mockReturnValue(of([chatUserMock]));

    currentUser.set(chatCreatorMock);

    confirmationServiceMock.confirm.mockReset();
    confirmationServiceMock.confirm.mockReturnValue(of(false));

    deleteChatServiceMock = {
      deleteChat: vi.fn(),
      succeeded$: new Subject<void>(),
    };

    routerMock.navigateByUrl.mockReset();

    await TestBed.configureTestingModule({
      imports: [SelectedChatHeader],
      providers: [
        {
          provide: CHAT_GATEWAY,
          useValue: chatGatewayMock,
        },
        {
          provide: CurrentSessionService,
          useValue: currentSessionServiceMock,
        },
        {
          provide: ConfirmationService,
          useValue: confirmationServiceMock,
        },
        {
          provide: Router,
          useValue: routerMock,
        },
      ],
    }).compileComponents();

    TestBed.overrideComponent(SelectedChatHeader, {
      set: {
        providers: [
          {
            provide: DeleteChatService,
            useValue: deleteChatServiceMock,
          },
        ],
      },
    });
  });

  it('should create', async () => {
    await createComponent('1');

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should load the members of the given chat', async () => {
    await createComponent('1');

    expect(chatGatewayMock.chatUsers).toHaveBeenCalledWith(1);
  });

  it('should show the chat title and its members', async () => {
    await createComponent('1');

    expect(getText()).toContain('Analytics Q3');
    expect(fixture.nativeElement.querySelector('app-chat-user-stack')).not.toBeNull();
  });

  describe('when the chat does not exist for the current user', () => {
    beforeEach(async () => {
      chatGatewayMock.chatUsers.mockReturnValue(
        throwError(() => new ApplicationError('mockReason')),
      );

      await createComponent('999');
    });

    it('should show an application error', () => {
      expect(getText()).toContain('mockReason');
    });

    it('should not show the header content', () => {
      expect(fixture.nativeElement.querySelector('app-chat-user-stack')).toBeNull();
    });
  });

  describe('deleting the chat', () => {
    it('shows the delete action to the chat creator with an accessible name', async () => {
      await createComponent('1');

      const deleteButton = getDeleteButton();

      expect(deleteButton).not.toBeNull();
      expect(deleteButton?.getAttribute('aria-label')).toBe('Delete chat');
    });

    it('hides the delete action from other chat members', async () => {
      currentUser.set({ ...chatCreatorMock, id: 999 });

      await createComponent('1');

      expect(getDeleteButton()).toBeNull();
    });

    it('hides the delete action before the chat list has loaded', async () => {
      await createComponent('1', { loadChats: false });

      expect(getDeleteButton()).toBeNull();
    });

    it('asks for confirmation naming the chat and marking the action as dangerous', async () => {
      await createComponent('1');

      getDeleteButton()?.click();

      expect(confirmationServiceMock.confirm).toHaveBeenCalledWith({
        title: 'Delete chat',
        subject: 'Analytics Q3',
        message: "The chat and its messages disappear for every member. This can't be undone.",
        confirmLabel: 'Delete',
        isDangerous: true,
      });
    });

    it('does not call the gateway when the confirmation is refused', async () => {
      confirmationServiceMock.confirm.mockReturnValue(of(false));

      await createComponent('1');

      getDeleteButton()?.click();

      expect(deleteChatServiceMock.deleteChat).not.toHaveBeenCalled();
    });

    it('deletes the chat when the confirmation is accepted', async () => {
      confirmationServiceMock.confirm.mockReturnValue(of(true));

      await createComponent('1');

      getDeleteButton()?.click();

      expect(deleteChatServiceMock.deleteChat).toHaveBeenCalledWith({ chatId: 1 });
    });

    it('navigates to / when the chat is deleted', async () => {
      await createComponent('1');

      deleteChatServiceMock.succeeded$.next();

      expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/');
    });
  });
});

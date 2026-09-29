import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';

import { ChatListService } from '../../application/chat-list/chat-list.service';
import { ChatUser } from '../../application/chat-user.type';
import { CHAT_GATEWAY } from '../../application/chat.gateway';
import { Chat } from '../../application/chat.type';
import { DeleteChatService } from '../../application/delete-chat/delete-chat.service';
import { SelectedChatHeader } from '../selected-chat-header/selected-chat-header';

import { SelectedChat } from './selected-chat';

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

describe('SelectedChat', () => {
  let fixture: ComponentFixture<SelectedChat>;

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

    fixture = TestBed.createComponent(SelectedChat);
    fixture.componentRef.setInput('chatId', chatId);
    await fixture.whenStable();
    fixture.detectChanges();
  };

  const getHeader = (): SelectedChatHeader | null =>
    fixture.debugElement.query(By.directive(SelectedChatHeader))?.componentInstance ?? null;

  const requestDeletion = (): void => {
    fixture.debugElement
      .query(By.directive(SelectedChatHeader))
      .triggerEventHandler('deleteRequested');
  };

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
      imports: [SelectedChat],
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

    TestBed.overrideComponent(SelectedChat, {
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

  describe('loading the chat users', () => {
    it('loads the members of the given chat', async () => {
      await createComponent('1');

      expect(chatGatewayMock.chatUsers).toHaveBeenCalledWith(1);
    });

    it('reloads the members when the chat changes', async () => {
      await createComponent('1');

      fixture.componentRef.setInput('chatId', '2');
      await fixture.whenStable();

      expect(chatGatewayMock.chatUsers).toHaveBeenLastCalledWith(2);
    });
  });

  describe('laying out the selected chat', () => {
    it('shows the header and the place for the conversation', async () => {
      await createComponent('1');

      expect(getHeader()).not.toBeNull();
      expect(fixture.nativeElement.querySelector('.selected-chat__conversation')).not.toBeNull();
    });

    it('passes the chat and its members to the header', async () => {
      await createComponent('1');

      expect(getHeader()?.chat()).toEqual(chatMock);
      expect(getHeader()?.chatUsers()).toEqual([chatUserMock]);
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
      expect(fixture.nativeElement.textContent).toContain('mockReason');
    });

    it('shows neither the header nor the place for the conversation', () => {
      expect(getHeader()).toBeNull();
      expect(fixture.nativeElement.querySelector('.selected-chat__conversation')).toBeNull();
    });
  });

  describe('deciding who the chat creator is', () => {
    it('tells the header that the current user is the chat creator', async () => {
      await createComponent('1');

      expect(getHeader()?.isChatCreator()).toBe(true);
    });

    it('tells the header that other chat members are not the chat creator', async () => {
      currentUser.set({ ...chatCreatorMock, id: 999 });

      await createComponent('1');

      expect(getHeader()?.isChatCreator()).toBe(false);
    });

    it('shows no header before the chat list has loaded', async () => {
      await createComponent('1', { loadChats: false });

      expect(getHeader()).toBeNull();
    });
  });

  describe('deleting the chat', () => {
    it('asks for confirmation naming the chat and marking the action as dangerous', async () => {
      await createComponent('1');

      requestDeletion();

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

      requestDeletion();

      expect(deleteChatServiceMock.deleteChat).not.toHaveBeenCalled();
    });

    it('deletes the chat when the confirmation is accepted', async () => {
      confirmationServiceMock.confirm.mockReturnValue(of(true));

      await createComponent('1');

      requestDeletion();

      expect(deleteChatServiceMock.deleteChat).toHaveBeenCalledWith({ chatId: 1 });
    });

    it('navigates to / when the chat is deleted', async () => {
      await createComponent('1');

      deleteChatServiceMock.succeeded$.next();

      expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/');
    });
  });
});

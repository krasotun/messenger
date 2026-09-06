import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ChatListService } from '../../application/chat-list/chat-list.service';
import { ChatUser } from '../../application/chat-user.type';
import { CHAT_GATEWAY } from '../../application/chat.gateway';
import { Chat } from '../../application/chat.type';

import { SelectedChatHeader } from './selected-chat-header';

import { ApplicationError } from '@shared/errors';

const chatGatewayMock = {
  chats: vi.fn(),
  chatUsers: vi.fn(),
};

const chatMock: Chat = {
  id: 1,
  title: 'Analytics Q3',
  avatar: null,
  unreadCount: 0,
  lastMessage: null,
};

const chatUserMock: ChatUser = {
  id: 2,
  name: 'Johnny',
  avatar: null,
};

describe('SelectedChatHeader', () => {
  let fixture: ComponentFixture<SelectedChatHeader>;

  const createComponent = async (chatId: string): Promise<void> => {
    fixture = TestBed.createComponent(SelectedChatHeader);
    fixture.componentRef.setInput('chatId', chatId);
    await fixture.whenStable();
    fixture.detectChanges();
  };

  const getText = (): string => fixture.nativeElement.textContent;

  beforeEach(async () => {
    chatGatewayMock.chats.mockReset();
    chatGatewayMock.chatUsers.mockReset();
    chatGatewayMock.chats.mockReturnValue(of([chatMock]));
    chatGatewayMock.chatUsers.mockReturnValue(of([chatUserMock]));

    await TestBed.configureTestingModule({
      imports: [SelectedChatHeader],
      providers: [
        {
          provide: CHAT_GATEWAY,
          useValue: chatGatewayMock,
        },
      ],
    }).compileComponents();

    TestBed.inject(ChatListService).loadChats();
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
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';

import { Chat } from '../../application/chat';
import { CHAT_GATEWAY } from '../../application/chat.gateway';
import { CreateChatModalContent } from '../create-chat-modal-content/create-chat-modal-content';

import { ChatList } from './chat-list';

import { ApplicationError } from '@shared/errors';
import { ModalService } from '@shared/ui/modal/modal-service';

const chatGatewayMock = {
  chats: vi.fn(),
};

const modalServiceMock = {
  open: vi.fn(),
};

const chatMock: Chat = {
  id: 1,
  title: 'Analytics Q3',
  avatar: null,
  unreadCount: 3,
  lastMessage: {
    authorName: 'John',
    content: 'the report is ready',
  },
};

describe('ChatList', () => {
  let component: ChatList;
  let fixture: ComponentFixture<ChatList>;

  const createComponent = async (): Promise<void> => {
    fixture = TestBed.createComponent(ChatList);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  };

  const getText = (): string => fixture.nativeElement.textContent;

  beforeEach(async () => {
    chatGatewayMock.chats.mockReset();
    chatGatewayMock.chats.mockReturnValue(of([chatMock]));
    modalServiceMock.open.mockReset();

    await TestBed.configureTestingModule({
      imports: [ChatList],
      providers: [
        provideRouter([]),
        {
          provide: CHAT_GATEWAY,
          useValue: chatGatewayMock,
        },
        {
          provide: ModalService,
          useValue: modalServiceMock,
        },
      ],
    }).compileComponents();
  });

  it('should create', async () => {
    await createComponent();

    expect(component).toBeTruthy();
  });

  it('should load chats when the screen opens', async () => {
    await createComponent();

    expect(chatGatewayMock.chats).toHaveBeenCalledOnce();
  });

  describe('when the current user has chats', () => {
    it('should render a row per chat', async () => {
      chatGatewayMock.chats.mockReturnValue(of([chatMock, { ...chatMock, id: 2 }]));

      await createComponent();

      expect(fixture.nativeElement.querySelectorAll('app-chat-list-item')).toHaveLength(2);
    });
  });

  describe('when there are no chats yet', () => {
    beforeEach(async () => {
      chatGatewayMock.chats.mockReturnValue(of([]));

      await createComponent();
    });

    it('should explain that there are no chats yet', () => {
      expect(getText()).toContain('No chats yet');
    });

    it('should keep chat creation available', () => {
      expect(fixture.nativeElement.querySelector('.chat-list__create')).not.toBeNull();
    });
  });

  describe('when the list fails to load', () => {
    beforeEach(async () => {
      chatGatewayMock.chats.mockReturnValue(throwError(() => new ApplicationError('mockReason')));

      await createComponent();
    });

    it('should show the error message', () => {
      expect(getText()).toContain('mockReason');
    });

    it('should not show the empty state instead of the error', () => {
      expect(getText()).not.toContain('No chats yet');
    });

    it('should load the list again on retry', async () => {
      chatGatewayMock.chats.mockReturnValue(of([chatMock]));

      fixture.nativeElement.querySelector('.chat-list__retry').click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(chatGatewayMock.chats).toHaveBeenCalledTimes(2);
      expect(fixture.nativeElement.querySelectorAll('app-chat-list-item')).toHaveLength(1);
      expect(getText()).not.toContain('mockReason');
    });
  });

  describe('create chat', () => {
    it('should open the create chat modal', async () => {
      await createComponent();

      fixture.nativeElement.querySelector('.chat-list__create').click();

      expect(modalServiceMock.open).toHaveBeenCalledOnce();
      expect(modalServiceMock.open).toHaveBeenCalledWith(CreateChatModalContent, {
        title: 'New chat',
      });
    });
  });

  describe('while the list is loading', () => {
    it('should show neither the empty state nor an error', async () => {
      chatGatewayMock.chats.mockReturnValue(new Subject<Chat[]>());

      await createComponent();

      expect(getText()).not.toContain('No chats yet');
      expect(fixture.nativeElement.querySelector('.chat-list__error')).toBeNull();
    });
  });
});

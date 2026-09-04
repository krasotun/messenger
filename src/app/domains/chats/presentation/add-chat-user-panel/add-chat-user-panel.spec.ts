import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';

import { AddChatUserStatus } from '../../application/add-chat-user/add-chat-user-status';
import { AddChatUserService } from '../../application/add-chat-user/add-chat-user.service';

import { AddChatUserPanel } from './add-chat-user-panel';

import { SearchUsersResult, SearchUsersService, User } from '@domains/identity-access';

let addChatUserServiceMock: {
  status: WritableSignal<AddChatUserStatus>;
  errorMessage: WritableSignal<string | null>;
  addChatUser: ReturnType<typeof vi.fn>;
};

const searchUsersServiceMock = {
  searchUsers: vi.fn(),
};

const userMock: User = {
  id: 2,
  login: 'jane.roe',
  name: 'Janie',
  avatar: null,
};

const debounceMs = 300;

describe('AddChatUserPanel', () => {
  let fixture: ComponentFixture<AddChatUserPanel>;
  let component: AddChatUserPanel;

  const search = (login: string): void => {
    component.loginControl.setValue(login);
    vi.advanceTimersByTime(debounceMs);
  };

  const getText = (): string => fixture.nativeElement.textContent;

  beforeEach(async () => {
    vi.useFakeTimers();

    addChatUserServiceMock = {
      status: signal(AddChatUserStatus.Idle),
      errorMessage: signal(null),
      addChatUser: vi.fn(),
    };

    searchUsersServiceMock.searchUsers.mockReset();

    await TestBed.configureTestingModule({
      imports: [AddChatUserPanel],
      providers: [
        {
          provide: SearchUsersService,
          useValue: searchUsersServiceMock,
        },
      ],
    }).compileComponents();

    TestBed.overrideComponent(AddChatUserPanel, {
      set: {
        providers: [
          {
            provide: AddChatUserService,
            useValue: addChatUserServiceMock,
          },
        ],
      },
    });

    fixture = TestBed.createComponent(AddChatUserPanel);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('chatId', 1);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  describe('поле пустое', () => {
    it('should show a hint to start typing a login', () => {
      fixture.detectChanges();

      expect(getText()).toContain('Начните вводить логин');
    });
  });

  describe('запрос идет', () => {
    it('should keep the previous results visible while the new request is pending', () => {
      fixture.detectChanges();

      searchUsersServiceMock.searchUsers.mockReturnValueOnce(of({ users: [userMock] }));

      search('ja');
      fixture.detectChanges();

      expect(getText()).toContain('Janie');

      searchUsersServiceMock.searchUsers.mockReturnValueOnce(new Subject<SearchUsersResult>());

      search('jane');
      fixture.detectChanges();

      expect(getText()).toContain('Janie');
      expect(getText()).not.toContain('Никого не нашли');
    });
  });

  describe('нашли', () => {
    it('should show the found users', () => {
      fixture.detectChanges();

      searchUsersServiceMock.searchUsers.mockReturnValue(of({ users: [userMock] }));

      search('jane');
      fixture.detectChanges();

      expect(getText()).toContain('Janie');
    });

    it('should add the clicked user to the given chat', () => {
      fixture.detectChanges();

      searchUsersServiceMock.searchUsers.mockReturnValue(of({ users: [userMock] }));

      search('jane');
      fixture.detectChanges();

      const userButton: HTMLButtonElement = fixture.nativeElement.querySelector(
        '.add-chat-user-panel__user',
      );

      userButton.click();

      expect(addChatUserServiceMock.addChatUser).toHaveBeenCalledWith({ chatId: 1, userId: 2 });
    });
  });

  describe('ответ пуст', () => {
    it('should show that nobody was found, distinct from the not-started hint', () => {
      fixture.detectChanges();

      searchUsersServiceMock.searchUsers.mockReturnValue(of({ users: [] }));

      search('nobody');
      fixture.detectChanges();

      expect(getText()).toContain('Никого не нашли');
      expect(getText()).not.toContain('Начните вводить логин');
    });
  });

  describe('400 на добавлении', () => {
    it('should show the rejection reason under the found users and keep the panel open', () => {
      fixture.detectChanges();

      searchUsersServiceMock.searchUsers.mockReturnValue(of({ users: [userMock] }));

      search('jane');

      addChatUserServiceMock.errorMessage.set('mockReason');
      fixture.detectChanges();

      expect(getText()).toContain('mockReason');
      expect(getText()).toContain('Janie');
    });
  });

  describe('успешное добавление', () => {
    it('should emit userAdded', () => {
      fixture.detectChanges();

      const userAddedSpy = vi.fn();
      component.userAdded.subscribe(userAddedSpy);

      addChatUserServiceMock.status.set(AddChatUserStatus.Success);
      fixture.detectChanges();

      expect(userAddedSpy).toHaveBeenCalledOnce();
    });
  });
});

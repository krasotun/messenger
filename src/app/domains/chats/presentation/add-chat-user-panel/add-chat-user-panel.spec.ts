import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';

import { AddChatUserService } from '../../application/add-chat-user/add-chat-user.service';

import { AddChatUserPanel } from './add-chat-user-panel';

import { SearchUsersResult, SearchUsersService, User } from '@domains/identity-access';

let addChatUserServiceMock: {
  succeeded$: Subject<void>;
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
      succeeded$: new Subject<void>(),
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

  describe('empty field', () => {
    it('should show a hint to start typing a login', () => {
      fixture.detectChanges();

      expect(getText()).toContain('Start typing a login');
    });
  });

  describe('request in flight', () => {
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
      expect(getText()).not.toContain('No users found');
    });
  });

  describe('found', () => {
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

  describe('empty response', () => {
    it('should show that nobody was found, distinct from the not-started hint', () => {
      fixture.detectChanges();

      searchUsersServiceMock.searchUsers.mockReturnValue(of({ users: [] }));

      search('nobody');
      fixture.detectChanges();

      expect(getText()).toContain('No users found');
      expect(getText()).not.toContain('Start typing a login');
    });
  });

  describe('400 on add', () => {
    it('should not render a submit error and keep the panel open', () => {
      fixture.detectChanges();

      searchUsersServiceMock.searchUsers.mockReturnValue(of({ users: [userMock] }));

      search('jane');
      fixture.detectChanges();

      const errorElement: HTMLElement | null = fixture.nativeElement.querySelector(
        '.add-chat-user-panel__error',
      );

      expect(errorElement).toBeNull();
      expect(getText()).toContain('Janie');
    });
  });

  describe('successful add', () => {
    it('should emit userAdded when the service reports success, without a manual application tick', () => {
      fixture.detectChanges();

      const userAddedSpy = vi.fn();
      component.userAdded.subscribe(userAddedSpy);

      addChatUserServiceMock.succeeded$.next();

      expect(userAddedSpy).toHaveBeenCalledOnce();
    });
  });
});

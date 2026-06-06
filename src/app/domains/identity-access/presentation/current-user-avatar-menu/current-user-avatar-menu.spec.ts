import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentSessionService } from '../../application/current-session/current-session.service';
import { CurrentUser } from '../../application/current-session/current-user';

import { CurrentUserAvatarMenu } from './current-user-avatar-menu';

const currentUserMock: CurrentUser = {
  id: 1,
  avatar: 'http://avatar.mock',
  displayName: 'displayName',
  email: 'email',
  firstName: 'firstName',
  login: 'login',
  phone: 'phone',
  secondName: 'secondName',
};

const currentSessionServiceMock = {
  currentUser: signal(currentUserMock).asReadonly(),
};

describe('CurrentUserAvatarMenu', () => {
  let component: CurrentUserAvatarMenu;
  let fixture: ComponentFixture<CurrentUserAvatarMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrentUserAvatarMenu],
      providers: [
        {
          provide: CurrentSessionService,
          useValue: currentSessionServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CurrentUserAvatarMenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders avatar for current session user', async () => {
    const avatarEl = fixture.nativeElement.querySelector('.avatar');

    fixture.detectChanges();
    await fixture.whenStable();

    expect(avatarEl).not.toBe(null);
  });
});

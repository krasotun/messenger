import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentSessionService } from '../../application/current-session/current-session.service';
import { CurrentUser } from '../../application/current-session/current-user';

import { CurrentUserAvatarMenu } from './current-user-avatar-menu';

import { Nullable } from '@app/shared/types';

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

describe('CurrentUserAvatarMenu', () => {
  let component: CurrentUserAvatarMenu;
  let fixture: ComponentFixture<CurrentUserAvatarMenu>;

  const currentUser = signal<Nullable<CurrentUser>>(currentUserMock);

  const currentSessionServiceMock = {
    currentUser: currentUser.asReadonly(),
  };

  beforeEach(async () => {
    currentUser.set(currentUserMock);

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
    fixture.detectChanges();
    await fixture.whenStable();

    const avatarEl = fixture.nativeElement.querySelector('.avatar');

    expect(avatarEl).not.toBe(null);

    const avatarImg = avatarEl.querySelector('.avatar__image');

    expect(avatarImg.getAttribute('src')).toBe(currentUserMock.avatar);

    expect(avatarImg.getAttribute('alt')).toBe(`Avatar ${currentUserMock.displayName}`);
  });

  it('renders one-letter fallback when current session user has no avatar', async () => {
    currentUser.set({
      ...currentUserMock,
      avatar: null,
    });

    fixture.detectChanges();
    await fixture.whenStable();

    const avatarFallback = fixture.nativeElement.querySelector('.avatar__fallback');

    expect(avatarFallback).not.toBe(null);
    expect(avatarFallback.textContent.trim()).toBe('D');
    expect(avatarFallback.getAttribute('aria-label')).toBe(`Avatar ${currentUserMock.displayName}`);
  });
});

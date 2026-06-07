import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { CurrentSessionService } from '../../application/current-session/current-session.service';
import { CurrentUser } from '../../application/current-session/current-user';

import { CurrentUserAvatarMenu } from './current-user-avatar-menu';

import { Nullable } from '@shared/types';

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
    logout: vi.fn(() => of(void 0)),
  };
  const routerMock = {
    navigateByUrl: vi.fn(),
  };

  function openMenuAndGetLogoutButton(): HTMLButtonElement {
    const popoverTrigger: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.current-user-avatar-menu__trigger',
    );

    popoverTrigger.dispatchEvent(new Event('click'));

    fixture.detectChanges();

    const buttons = Array.from(
      document.querySelectorAll('.current-user-avatar-menu__action'),
    ) as HTMLButtonElement[];

    const logoutButton = buttons.find((button) => button.textContent?.trim() === 'Logout');

    expect(logoutButton).toBeTruthy();

    return logoutButton as HTMLButtonElement;
  }

  beforeEach(async () => {
    currentUser.set(currentUserMock);
    currentSessionServiceMock.logout.mockReset();
    currentSessionServiceMock.logout.mockReturnValue(of(void 0));
    routerMock.navigateByUrl.mockReset();

    await TestBed.configureTestingModule({
      imports: [CurrentUserAvatarMenu],
      providers: [
        {
          provide: CurrentSessionService,
          useValue: currentSessionServiceMock,
        },
        {
          provide: Router,
          useValue: routerMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CurrentUserAvatarMenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    document.body.querySelectorAll('.cdk-overlay-container').forEach((element) => element.remove());
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

  it('calls logout through CurrentSessionService when Logout is clicked', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const popoverTrigger: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.current-user-avatar-menu__trigger',
    );

    popoverTrigger.dispatchEvent(new Event('click'));

    fixture.detectChanges();
    await fixture.whenStable();

    const buttons = Array.from(
      document.querySelectorAll('.current-user-avatar-menu__action'),
    ) as HTMLButtonElement[];

    const logoutButton = buttons.find((button) => button.textContent?.trim() === 'Logout');

    expect(logoutButton).toBeTruthy();

    logoutButton?.dispatchEvent(new Event('click'));

    expect(currentSessionServiceMock.logout).toHaveBeenCalledOnce();
  });

  it('navigates to sign in after successful logout', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const logoutButton = openMenuAndGetLogoutButton();

    logoutButton.dispatchEvent(new Event('click'));

    await fixture.whenStable();

    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/sign-in');
  });

  it('navigates to sign in after logout error', async () => {
    currentSessionServiceMock.logout.mockReturnValue(throwError(() => 'mockError'));

    fixture.detectChanges();
    await fixture.whenStable();

    const logoutButton = openMenuAndGetLogoutButton();

    logoutButton.dispatchEvent(new Event('click'));

    await fixture.whenStable();

    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/sign-in');
  });
});

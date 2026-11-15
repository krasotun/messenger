import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { render, screen, within } from '@testing-library/angular/zoneless';
import { userEvent, UserEvent } from '@testing-library/user-event';
import { DialogService } from 'primeng/dynamicdialog';
import { of, Subject, throwError } from 'rxjs';

import { AUTH_GATEWAY, CurrentSessionResult } from '../../data/auth-gateway';
import { CurrentSessionStore } from '../../data/current-session-store';
import { USER_GATEWAY } from '../../data/user-gateway';

import { CurrentUserAvatarMenu } from './current-user-avatar-menu';

import { UserMocks } from '@domains/users/testing';
import { NOTIFIER } from '@shared/notifications';
import { NotificationMocks } from '@shared/notifications/testing';

const currentUserMock = UserMocks.currentUser({
  avatar: 'http://avatar.mock',
  displayName: 'displayName',
});

const refreshedUserMock = UserMocks.currentUser({
  ...currentUserMock,
  firstName: 'Refreshed',
});

const avatarLabel = `Avatar ${currentUserMock.displayName}`;

@Component({
  selector: 'app-sign-in-page',
  template: '',
})
class SignInPageStub {}

describe('CurrentUserAvatarMenu', () => {
  let fixture: ComponentFixture<CurrentUserAvatarMenu>;
  let user: UserEvent;
  let authGatewayMock: ReturnType<typeof UserMocks.authGateway>;

  // Меню открывается в overlay, вне корня компонента: поиск идет по screen.
  const clickMenuAction = async (name: string): Promise<void> => {
    await user.click(screen.getByRole('button', { name: avatarLabel }));
    await user.click(screen.getByRole('button', { name }));
    await fixture.whenStable();
  };

  beforeEach(async () => {
    user = userEvent.setup();
    authGatewayMock = UserMocks.authGateway();
    authGatewayMock.currentSession.mockReturnValue(
      of(UserMocks.authenticatedSession(currentUserMock)),
    );
    authGatewayMock.logout.mockReturnValue(of(void 0));

    ({ fixture } = await render(CurrentUserAvatarMenu, {
      providers: [
        { provide: AUTH_GATEWAY, useValue: authGatewayMock },
        { provide: USER_GATEWAY, useValue: UserMocks.userGateway() },
        { provide: NOTIFIER, useValue: NotificationMocks.notifier() },
        provideRouter([{ path: 'sign-in', component: SignInPageStub }]),
        DialogService,
      ],
      configureTestBed: (testBed) => {
        testBed.inject(CurrentSessionStore).restoreCurrentSession().subscribe();
      },
      waitForStableOnRender: true,
    }));
  });

  afterEach(() => {
    document.body.querySelectorAll('.cdk-overlay-container').forEach((element) => element.remove());
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders avatar for current session user', () => {
    expect(screen.getByRole('img', { name: avatarLabel })).toHaveAttribute(
      'src',
      currentUserMock.avatar,
    );
  });

  it('renders one-letter fallback when current session user has no avatar', async () => {
    authGatewayMock.currentSession.mockReturnValue(
      of(UserMocks.authenticatedSession({ ...currentUserMock, avatar: null })),
    );
    TestBed.inject(CurrentSessionStore).restoreCurrentSession().subscribe();

    await fixture.whenStable();

    expect(screen.getByRole('img', { name: avatarLabel })).toHaveTextContent('D');
  });

  it('calls logout through the store when Logout is clicked', async () => {
    await clickMenuAction('Logout');

    expect(authGatewayMock.logout).toHaveBeenCalledOnce();
  });

  it('navigates to sign in after successful logout', async () => {
    await clickMenuAction('Logout');

    expect(TestBed.inject(Router).url).toBe('/sign-in');
  });

  it('navigates to sign in after logout error', async () => {
    authGatewayMock.logout.mockReturnValue(throwError(() => 'mockError'));

    await clickMenuAction('Logout');

    expect(TestBed.inject(Router).url).toBe('/sign-in');
  });

  describe('edit profile', () => {
    const queryEditProfileDialog = (): HTMLElement | null =>
      screen.queryByRole('dialog', { name: 'Edit profile' });

    it('closes the menu immediately, before the current user answer', async () => {
      authGatewayMock.currentSession.mockReturnValue(new Subject<CurrentSessionResult>());

      await clickMenuAction('Edit profile');

      expect(screen.queryByRole('button', { name: 'Edit profile' })).not.toBeInTheDocument();
    });

    it('does not open the dialog before the current user answer', async () => {
      authGatewayMock.currentSession.mockReturnValue(new Subject<CurrentSessionResult>());

      await clickMenuAction('Edit profile');

      expect(queryEditProfileDialog()).not.toBeInTheDocument();
    });

    it('opens the update profile dialog with the refreshed user after the answer', async () => {
      authGatewayMock.currentSession.mockReturnValue(
        of(UserMocks.authenticatedSession(refreshedUserMock)),
      );

      await clickMenuAction('Edit profile');

      const dialog = await screen.findByRole('dialog', { name: 'Edit profile' });

      expect(within(dialog).getByLabelText('First name')).toHaveValue('Refreshed');
    });

    it('does not open the dialog when the request completes without a value', async () => {
      authGatewayMock.currentSession.mockReturnValue(of(UserMocks.anonymousSession()));

      await clickMenuAction('Edit profile');

      expect(queryEditProfileDialog()).not.toBeInTheDocument();
    });
  });

  describe('change password', () => {
    it('opens the change password dialog when Change password is clicked', async () => {
      await clickMenuAction('Change password');

      const dialog = await screen.findByRole('dialog', { name: 'Change password' });

      expect(within(dialog).getByLabelText('Old password')).toBeInTheDocument();
    });

    it('closes the menu when Change password is clicked', async () => {
      await clickMenuAction('Change password');

      expect(screen.queryByRole('button', { name: 'Change password' })).not.toBeInTheDocument();
    });

    it('does not request the current user when Change password is clicked', async () => {
      authGatewayMock.currentSession.mockClear();

      await clickMenuAction('Change password');

      expect(authGatewayMock.currentSession).not.toHaveBeenCalled();
    });
  });
});

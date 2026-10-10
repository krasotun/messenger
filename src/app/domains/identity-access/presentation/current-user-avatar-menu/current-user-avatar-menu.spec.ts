import { signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { render, screen } from '@testing-library/angular/zoneless';
import { userEvent, UserEvent } from '@testing-library/user-event';
import { of, throwError } from 'rxjs';

import { CurrentSessionService } from '../../application/current-session/current-session.service';
import { CurrentUser } from '../../application/current-session/current-user.type';
import { ChangePasswordModalContent } from '../change-password-modal-content/change-password-modal-content';
import { UpdateProfileModalContent } from '../update-profile-modal-content/update-profile-modal-content';

import { CurrentUserAvatarMenu } from './current-user-avatar-menu';

import { IdentityMocks } from '@domains/identity-access/testing';
import { Nullable } from '@shared/types';
import { ModalService } from '@shared/ui/modal/modal-service';
import { ModalMocks } from '@shared/ui/modal/testing';

const currentUserMock = IdentityMocks.currentUser({
  avatar: 'http://avatar.mock',
  displayName: 'displayName',
});

const avatarLabel = `Avatar ${currentUserMock.displayName}`;

describe('CurrentUserAvatarMenu', () => {
  let fixture: ComponentFixture<CurrentUserAvatarMenu>;
  let user: UserEvent;

  const currentUser = signal<Nullable<CurrentUser>>(currentUserMock);

  const currentSessionServiceMock = {
    currentUser: currentUser.asReadonly(),
    logout: vi.fn(() => of(void 0)),
  };
  const routerMock = {
    navigateByUrl: vi.fn(),
  };
  let modalServiceMock: ReturnType<typeof ModalMocks.modalService>;

  // Меню открывается в overlay, вне корня компонента: поиск идет по screen.
  const clickMenuAction = async (name: string): Promise<void> => {
    await user.click(screen.getByRole('button', { name: avatarLabel }));
    await user.click(screen.getByRole('button', { name }));
    await fixture.whenStable();
  };

  beforeEach(async () => {
    user = userEvent.setup();
    currentUser.set(currentUserMock);
    currentSessionServiceMock.logout.mockReset();
    currentSessionServiceMock.logout.mockReturnValue(of(void 0));
    routerMock.navigateByUrl.mockReset();
    modalServiceMock = ModalMocks.modalService();

    ({ fixture } = await render(CurrentUserAvatarMenu, {
      providers: [
        { provide: CurrentSessionService, useValue: currentSessionServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ModalService, useValue: modalServiceMock },
      ],
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
    currentUser.set({
      ...currentUserMock,
      avatar: null,
    });

    await fixture.whenStable();

    expect(screen.getByRole('img', { name: avatarLabel })).toHaveTextContent('D');
  });

  it('calls logout through CurrentSessionService when Logout is clicked', async () => {
    await clickMenuAction('Logout');

    expect(currentSessionServiceMock.logout).toHaveBeenCalledOnce();
  });

  it('navigates to sign in after successful logout', async () => {
    await clickMenuAction('Logout');

    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/sign-in');
  });

  it('opens update profile modal when Edit profile is clicked', async () => {
    await clickMenuAction('Edit profile');

    expect(modalServiceMock.open).toHaveBeenCalledWith(UpdateProfileModalContent, {
      title: 'Edit profile',
    });
  });

  it('closes the menu when Edit profile is clicked', async () => {
    await clickMenuAction('Edit profile');

    expect(screen.queryByRole('button', { name: 'Edit profile' })).not.toBeInTheDocument();
  });

  it('opens the change password modal when Change password is clicked', async () => {
    await clickMenuAction('Change password');

    expect(modalServiceMock.open).toHaveBeenCalledWith(ChangePasswordModalContent, {
      title: 'Change password',
    });
  });

  it('closes the menu when Change password is clicked', async () => {
    await clickMenuAction('Change password');

    expect(screen.queryByRole('button', { name: 'Change password' })).not.toBeInTheDocument();
  });

  it('navigates to sign in after logout error', async () => {
    currentSessionServiceMock.logout.mockReturnValue(throwError(() => 'mockError'));

    await clickMenuAction('Logout');

    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/sign-in');
  });
});

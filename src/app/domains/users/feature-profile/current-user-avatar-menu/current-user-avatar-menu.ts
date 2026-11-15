import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Menu } from 'primeng/menu';

import { CurrentSessionStore } from '../../data/current-session-store';
import { CurrentUser } from '../../data/current-user';
import { ChangePasswordModalContent } from '../change-password-modal-content/change-password-modal-content';
import { UpdateProfileModalContent } from '../update-profile-modal-content/update-profile-modal-content';

import { Nullable } from '@shared/types';
import { Avatar } from '@shared/ui/avatar/avatar';
import { DIALOG_DEFAULTS } from '@shared/ui/dialog/dialog-defaults.constants';

interface CurrentUserAvatarView {
  imageUrl: Nullable<string>;
  label: string;
  name: string;
}

@Component({
  selector: 'app-current-user-avatar-menu',
  imports: [Avatar, Menu],
  templateUrl: './current-user-avatar-menu.html',
  styleUrl: './current-user-avatar-menu.scss',
})
export class CurrentUserAvatarMenu {
  private readonly _currentSessionStore = inject(CurrentSessionStore);
  private readonly _router = inject(Router);
  private readonly _dialogService = inject(DialogService);

  protected readonly menuItems: MenuItem[] = [
    { label: 'Edit profile', command: () => this._editProfile() },
    { label: 'Change password', command: () => this._changePassword() },
    { label: 'Logout', command: () => this._logout() },
  ];

  readonly currentUserAvatarView = computed<Nullable<CurrentUserAvatarView>>(() => {
    const currentUser = this._currentSessionStore.currentUser();

    return currentUser ? this._toAvatarView(currentUser) : null;
  });

  private _editProfile(): void {
    this._currentSessionStore.refreshCurrentUser().subscribe((currentUser) => {
      this._dialogService.open(UpdateProfileModalContent, {
        ...DIALOG_DEFAULTS,
        header: 'Edit profile',
        inputValues: { currentUser },
      });
    });
  }

  private _changePassword(): void {
    this._dialogService.open(ChangePasswordModalContent, {
      ...DIALOG_DEFAULTS,
      header: 'Change password',
    });
  }

  private _logout(): void {
    this._currentSessionStore.logout().subscribe({
      next: () => {
        this._router.navigateByUrl('/sign-in');
      },
      error: () => {
        this._router.navigateByUrl('/sign-in');
      },
    });
  }

  private _getUserName(currentUser: CurrentUser): string {
    return (
      currentUser.displayName ||
      currentUser.firstName ||
      currentUser.login ||
      currentUser.email
    ).trim();
  }

  private _toAvatarView(currentUser: CurrentUser): CurrentUserAvatarView {
    const userName = this._getUserName(currentUser);

    return {
      imageUrl: currentUser.avatar,
      label: `Avatar ${userName}`,
      name: userName,
    };
  }
}

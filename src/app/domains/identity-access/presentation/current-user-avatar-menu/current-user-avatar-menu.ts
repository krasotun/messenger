import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

import { CurrentSessionService } from '../../application/current-session/current-session.service';
import { CurrentUser } from '../../application/current-session/current-user';

import { Nullable } from '@shared/types';
import { Avatar } from '@shared/ui/avatar/avatar';
import { Popover } from '@shared/ui/popover/popover';

interface CurrentUserAvatarView {
  imageUrl: Nullable<string>;
  label: string;
  fallbackText: string;
}

@Component({
  selector: 'app-current-user-avatar-menu',
  imports: [Avatar, Popover],
  templateUrl: './current-user-avatar-menu.html',
  styleUrl: './current-user-avatar-menu.scss',
})
export class CurrentUserAvatarMenu {
  private readonly _currentSessionService = inject(CurrentSessionService);
  private readonly _router = inject(Router);

  readonly currentUserAvatarView = computed<Nullable<CurrentUserAvatarView>>(() => {
    const currentUser = this._currentSessionService.currentUser();

    return currentUser ? this._toAvatarView(currentUser) : null;
  });

  protected logout(): void {
    this._currentSessionService.logout().subscribe({
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
      fallbackText: userName[0].toUpperCase(),
    };
  }
}

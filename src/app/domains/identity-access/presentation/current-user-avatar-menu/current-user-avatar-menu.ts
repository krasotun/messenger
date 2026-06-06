import { Component, computed, inject } from '@angular/core';

import { CurrentSessionService } from '../../application/current-session/current-session.service';
import { CurrentUser } from '../../application/current-session/current-user';

import { Nullable } from '@app/shared/types';
import { Avatar } from '@app/shared/ui/avatar/avatar';

interface CurrentUserAvatarView {
  imageUrl: Nullable<string>;
  label: string;
  fallbackText: string;
}

@Component({
  selector: 'app-current-user-avatar-menu',
  imports: [Avatar],
  templateUrl: './current-user-avatar-menu.html',
  styleUrl: './current-user-avatar-menu.scss',
})
export class CurrentUserAvatarMenu {
  private readonly _currentSessionService = inject(CurrentSessionService);

  readonly currentUserAvatarView = computed<Nullable<CurrentUserAvatarView>>(() => {
    const currentUser = this._currentSessionService.currentUser();

    return currentUser ? this._toAvatarView(currentUser) : null;
  });

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

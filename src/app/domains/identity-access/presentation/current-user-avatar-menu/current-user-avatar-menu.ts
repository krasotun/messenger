import { Component, inject } from '@angular/core';

import { CurrentSessionService } from '../../application/current-session/current-session.service';

import { Avatar } from '@app/shared/ui/avatar/avatar';

// interface CurrentUserAvatarView {
//   imageUrl: Nullable<string>;
//   label: string;
//   fallbackText: string;
// }

@Component({
  selector: 'app-current-user-avatar-menu',
  imports: [Avatar],
  templateUrl: './current-user-avatar-menu.html',
  styleUrl: './current-user-avatar-menu.scss',
})
export class CurrentUserAvatarMenu {
  private readonly _currentSessionService = inject(CurrentSessionService);

  readonly currentUserAvatarView = {};
}

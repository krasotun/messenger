import { Component } from '@angular/core';

import { CurrentUserAvatarMenu } from '@domains/identity-access/presentation/current-user-avatar-menu/current-user-avatar-menu';

@Component({
  selector: 'app-header',
  imports: [CurrentUserAvatarMenu],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {}

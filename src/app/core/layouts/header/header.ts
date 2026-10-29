import { Component } from '@angular/core';

import { CurrentUserAvatarMenu } from '@domains/users';

@Component({
  selector: 'app-header',
  imports: [CurrentUserAvatarMenu],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {}

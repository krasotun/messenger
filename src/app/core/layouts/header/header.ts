import { Component } from '@angular/core';

import { CurrentUserAvatarMenu } from '@domains/identity-access';

@Component({
  selector: 'app-header',
  imports: [CurrentUserAvatarMenu],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {}

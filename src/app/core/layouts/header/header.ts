import { Component } from '@angular/core';

import { Avatar } from '@app/shared/ui/avatar/avatar';
import { Popover } from '@app/shared/ui/popover/popover';

@Component({
  selector: 'app-header',
  imports: [Popover, Avatar],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {}

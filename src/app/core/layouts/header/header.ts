import { Component } from '@angular/core';

import { Popover } from '@app/shared/ui/popover/popover';

@Component({
  selector: 'app-header',
  imports: [Popover],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {}

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Header } from '../header/header';

@Component({
  selector: 'app-authenticated-shell',
  imports: [Header, RouterOutlet],
  templateUrl: './authenticated-shell.html',
  styleUrl: './authenticated-shell.scss',
})
export class AuthenticatedShell {}

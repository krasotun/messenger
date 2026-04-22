import { Component } from '@angular/core';

import { AuthPageShell } from '@domains/identity-access/presentation/auth-page-shell/auth-page-shell';
import { SignUpForm } from '@domains/identity-access/presentation/sign-up-form/sign-up-form';

@Component({
  selector: 'app-sign-up-page',
  imports: [SignUpForm, AuthPageShell],
  templateUrl: './sign-up-page.html',
  styleUrl: './sign-up-page.scss',
})
export class SignUpPage {}

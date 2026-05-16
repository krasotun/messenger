import { Component } from '@angular/core';

import { AuthFormShell } from '../auth-form-shell/auth-form-shell';
import { AuthPageShell } from '../auth-page-shell/auth-page-shell';
import { SignInForm } from '../sign-in-form/sign-in-form';

@Component({
  selector: 'app-sign-in-page',
  imports: [AuthPageShell, AuthFormShell, SignInForm],
  templateUrl: './sign-in-page.html',
  styleUrl: './sign-in-page.scss',
})
export class SignInPage {}

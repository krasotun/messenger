import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthFormShell } from '@domains/identity-access/presentation/auth-form-shell/auth-form-shell';
import { AuthPageShell } from '@domains/identity-access/presentation/auth-page-shell/auth-page-shell';
import { SignUpForm } from '@domains/identity-access/presentation/sign-up-form/sign-up-form';

@Component({
  selector: 'app-sign-up-page',
  imports: [SignUpForm, AuthPageShell, AuthFormShell],
  templateUrl: './sign-up-page.html',
  styleUrl: './sign-up-page.scss',
})
export class SignUpPage {
  private readonly _router = inject(Router);

  protected goToSignIn(): void {
    this._router.navigate(['sign-in']);
  }
}

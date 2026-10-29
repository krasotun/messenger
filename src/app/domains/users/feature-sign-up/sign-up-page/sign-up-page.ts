import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { SignUpForm } from '@domains/users/feature-sign-up/sign-up-form/sign-up-form';
import { AuthFormShell } from '@domains/users/ui/auth-form-shell/auth-form-shell';
import { AuthPageShell } from '@domains/users/ui/auth-page-shell/auth-page-shell';

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

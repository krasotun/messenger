import { Component } from '@angular/core';

import { SignUpForm } from '@app/domains/identity-access/presentation/sign-up-form/sign-up-form';

@Component({
  selector: 'app-sign-up-page',
  imports: [SignUpForm],
  templateUrl: './sign-up-page.html',
  styleUrl: './sign-up-page.scss',
})
export class SignUpPage {}

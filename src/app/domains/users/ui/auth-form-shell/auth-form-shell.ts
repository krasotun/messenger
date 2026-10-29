import { Component, input } from '@angular/core';

@Component({
  selector: 'app-auth-form-shell',
  imports: [],
  templateUrl: './auth-form-shell.html',
  styleUrl: './auth-form-shell.scss',
})
export class AuthFormShell {
  readonly formTitle = input.required<string>();
}

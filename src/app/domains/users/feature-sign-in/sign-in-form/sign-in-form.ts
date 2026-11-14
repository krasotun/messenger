import { Component, inject, output, signal } from '@angular/core';
import { form, required } from '@angular/forms/signals';

import { SignInInput } from '../../data/auth-gateway';
import { CurrentSessionStore } from '../../data/current-session-store';

import { connectSubmitFlow, lockFormWhileSubmitting } from '@shared/forms';
import { createFormSubmitFlowState } from '@shared/submit-flow';
import { Form } from '@shared/ui/form/form';
import { FormTextField } from '@shared/ui/form/form-text-field';

@Component({
  selector: 'app-sign-in-form',
  imports: [Form],
  templateUrl: './sign-in-form.html',
})
export class SignInForm {
  readonly signInSucceeded = output<void>();

  private readonly _currentSessionStore = inject(CurrentSessionStore);

  private readonly _signInFlow = createFormSubmitFlowState();

  private readonly _signInValue = signal<SignInInput>({ login: '', password: '' });

  readonly signInForm = form(this._signInValue, (path) => {
    required(path.login);
    required(path.password);
    lockFormWhileSubmitting(path, this._signInFlow.isSubmitting);
  });

  protected readonly isSubmitting = this._signInFlow.isSubmitting;

  protected readonly fields: FormTextField[] = [
    { label: 'Login', type: 'text', field: this.signInForm.login },
    { label: 'Password', type: 'password', field: this.signInForm.password },
  ];

  constructor() {
    connectSubmitFlow(this._signInFlow, this.signInSucceeded);
  }

  protected onSubmit(): void {
    this._currentSessionStore.signIn(this._signInValue(), this._signInFlow);
  }
}

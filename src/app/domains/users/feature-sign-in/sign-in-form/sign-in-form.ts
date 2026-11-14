import { Component, inject, output, signal } from '@angular/core';
import { required } from '@angular/forms/signals';

import { SignInInput } from '../../data/auth-gateway';
import { CurrentSessionStore } from '../../data/current-session-store';

import { createSubmitFlowForm } from '@shared/forms';
import { createFormSubmitFlowState } from '@shared/submit-flow';
import { Form } from '@shared/ui/form/form';
import { TextFieldConfig } from '@shared/ui/text-field/text-field-config.type';

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

  readonly signInForm = createSubmitFlowForm({
    value: this._signInValue,
    schema: (path) => {
      required(path.login);
      required(path.password);
    },
    flow: this._signInFlow,
    succeeded: this.signInSucceeded,
  });

  protected readonly isSubmitting = this._signInFlow.isSubmitting;

  protected readonly fields: TextFieldConfig[] = [
    { label: 'Login', type: 'text', field: this.signInForm.login },
    { label: 'Password', type: 'password', field: this.signInForm.password },
  ];

  protected onSubmit(): void {
    this._currentSessionStore.signIn(this._signInValue(), this._signInFlow);
  }
}

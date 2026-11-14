import { Component, inject, output, signal } from '@angular/core';
import { apply, form, required } from '@angular/forms/signals';

import { SignUpInput } from '@domains/users/data/auth-gateway';
import { CurrentSessionStore } from '@domains/users/data/current-session-store';
import { emailSchema, phoneSchema } from '@domains/users/data/user-field-schemas';
import { connectSubmitFlow, lockFormWhileSubmitting } from '@shared/forms';
import { createFormSubmitFlowState } from '@shared/submit-flow';
import { Form } from '@shared/ui/form/form';
import { FormTextField } from '@shared/ui/form/form-text-field';

@Component({
  selector: 'app-sign-up-form',
  imports: [Form],
  templateUrl: './sign-up-form.html',
})
export class SignUpForm {
  readonly signUpSucceeded = output<void>();

  private readonly _currentSessionStore = inject(CurrentSessionStore);

  private readonly _signUpFlow = createFormSubmitFlowState();

  private readonly _signUpValue = signal<SignUpInput>({
    firstName: '',
    secondName: '',
    login: '',
    email: '',
    password: '',
    phone: '',
  });

  readonly signUpForm = form(this._signUpValue, (path) => {
    required(path.firstName);
    required(path.secondName);
    required(path.login);
    apply(path.email, emailSchema);
    required(path.password);
    apply(path.phone, phoneSchema);
    lockFormWhileSubmitting(path, this._signUpFlow.isSubmitting);
  });

  protected readonly isSubmitting = this._signUpFlow.isSubmitting;

  protected readonly fields: FormTextField[] = [
    { label: 'First name', type: 'text', field: this.signUpForm.firstName },
    { label: 'Second name', type: 'text', field: this.signUpForm.secondName },
    { label: 'Login', type: 'text', field: this.signUpForm.login },
    { label: 'Email', type: 'email', field: this.signUpForm.email },
    { label: 'Password', type: 'password', field: this.signUpForm.password },
    { label: 'Mobile phone', type: 'text', field: this.signUpForm.phone },
  ];

  constructor() {
    connectSubmitFlow(this._signUpFlow, this.signUpSucceeded);
  }

  protected onSubmit(): void {
    this._currentSessionStore.signUp(this._signUpValue(), this._signUpFlow);
  }
}

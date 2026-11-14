import { Component, inject, output, signal } from '@angular/core';
import { apply, required } from '@angular/forms/signals';

import { SignUpInput } from '@domains/users/data/auth-gateway';
import { CurrentSessionStore } from '@domains/users/data/current-session-store';
import { userFieldsSchema } from '@domains/users/ui/user-fields-schema';
import { createSubmitFlowForm } from '@shared/forms';
import { createFormSubmitFlowState } from '@shared/submit-flow';
import { Form } from '@shared/ui/form/form';
import { TextFieldConfig } from '@shared/ui/text-field/text-field-config.type';

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

  readonly signUpForm = createSubmitFlowForm({
    value: this._signUpValue,
    schema: (path) => {
      apply(path, userFieldsSchema);
      required(path.password);
    },
    flow: this._signUpFlow,
    succeeded: this.signUpSucceeded,
  });

  protected readonly isSubmitting = this._signUpFlow.isSubmitting;

  protected readonly fields: TextFieldConfig[] = [
    { label: 'First name', type: 'text', field: this.signUpForm.firstName },
    { label: 'Second name', type: 'text', field: this.signUpForm.secondName },
    { label: 'Login', type: 'text', field: this.signUpForm.login },
    { label: 'Email', type: 'email', field: this.signUpForm.email },
    { label: 'Password', type: 'password', field: this.signUpForm.password },
    { label: 'Mobile phone', type: 'text', field: this.signUpForm.phone },
  ];

  protected onSubmit(): void {
    this._currentSessionStore.signUp(this._signUpValue(), this._signUpFlow);
  }
}

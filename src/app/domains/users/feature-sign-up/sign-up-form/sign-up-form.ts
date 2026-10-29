import { Component, inject, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { CurrentSessionStore } from '@domains/users/data/current-session-store';
import { emailPattern, phonePattern } from '@domains/users/data/user-field-patterns';
import { connectSubmitFlow } from '@shared/forms';
import { createFormSubmitFlowState } from '@shared/submit-flow';
import { Form } from '@shared/ui/form/form';
import { FormField } from '@shared/ui/form-field/form-field';
import { Input } from '@shared/ui/input/input';

interface SignUpFormModel {
  firstName: FormControl<string>;
  secondName: FormControl<string>;
  login: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  phone: FormControl<string>;
}

@Component({
  selector: 'app-sign-up-form',
  imports: [Input, FormField, Form, ReactiveFormsModule],
  templateUrl: './sign-up-form.html',
})
export class SignUpForm {
  readonly signUpForm = new FormGroup<SignUpFormModel>({
    firstName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    secondName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    login: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(emailPattern)],
    }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    phone: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(phonePattern),
        Validators.minLength(10),
        Validators.maxLength(15),
      ],
    }),
  });

  readonly signUpSucceeded = output<void>();

  private readonly _currentSessionStore = inject(CurrentSessionStore);

  private readonly _signUpFlow = createFormSubmitFlowState();

  protected readonly isSubmitting = this._signUpFlow.isSubmitting;

  protected readonly fields = [
    { label: 'First name', type: 'text', control: this.signUpForm.controls.firstName },
    { label: 'Second name', type: 'text', control: this.signUpForm.controls.secondName },
    { label: 'Login', type: 'text', control: this.signUpForm.controls.login },
    { label: 'Email', type: 'email', control: this.signUpForm.controls.email },
    { label: 'Password', type: 'password', control: this.signUpForm.controls.password },
    { label: 'Mobile phone', type: 'text', control: this.signUpForm.controls.phone },
  ];

  constructor() {
    connectSubmitFlow(this.signUpForm, this._signUpFlow, this.signUpSucceeded);
  }

  protected onSubmit(): void {
    const signUpFormValue = this.signUpForm.getRawValue();
    this._currentSessionStore.signUp(signUpFormValue, this._signUpFlow);
  }
}

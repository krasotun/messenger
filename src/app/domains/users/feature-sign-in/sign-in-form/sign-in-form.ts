import { Component, inject, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { CurrentSessionStore } from '../../data/current-session-store';

import { connectSubmitFlow } from '@shared/forms';
import { createFormSubmitFlowState } from '@shared/submit-flow';
import { Form } from '@shared/ui/form/form';
import { FormField } from '@shared/ui/form-field/form-field';
import { Input } from '@shared/ui/input/input';

interface SignInFormModel {
  login: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'app-sign-in-form',
  imports: [Input, FormField, Form, ReactiveFormsModule],
  templateUrl: './sign-in-form.html',
})
export class SignInForm {
  readonly signInForm = new FormGroup<SignInFormModel>({
    login: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  readonly signInSucceeded = output<void>();

  private readonly _currentSessionStore = inject(CurrentSessionStore);

  private readonly _signInFlow = createFormSubmitFlowState();

  protected readonly isSubmitting = this._signInFlow.isSubmitting;

  protected readonly fields = [
    { label: 'Login', type: 'text', control: this.signInForm.controls.login },
    { label: 'Password', type: 'password', control: this.signInForm.controls.password },
  ];

  constructor() {
    connectSubmitFlow(this.signInForm, this._signInFlow, this.signInSucceeded);
  }

  protected onSubmit(): void {
    const signInFormValue = this.signInForm.getRawValue();
    this._currentSessionStore.signIn(signInFormValue, this._signInFlow);
  }
}

import { Component, effect, inject, output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

import { AuthFlowStatus } from '../../application/auth-flow-status';
import { SignInService } from '../../application/sign-in/sign-in.service';

import { Button } from '@app/shared/ui/button/button';
import { FormField } from '@app/shared/ui/form-field/form-field';
import { Input } from '@shared/ui/input/input';

interface SignInFormModel {
  login: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'app-sign-in-form',
  imports: [Input, FormField, Button, ReactiveFormsModule],
  templateUrl: './sign-in-form.html',
  styleUrl: './sign-in-form.scss',
})
export class SignInForm {
  readonly signInForm = new FormGroup<SignInFormModel>({
    login: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  readonly signInSucceeded = output<void>();

  private readonly _signInService = inject(SignInService);

  protected readonly isSubmitting = this._signInService.isSubmitting;
  protected readonly errorMessage = this._signInService.errorMessage;

  constructor() {
    effect(() => {
      if (this.isSubmitting()) {
        this.signInForm.disable({ emitEvent: false });
      } else {
        this.signInForm.enable({ emitEvent: false });
      }
    });

    effect(() => {
      if (this._signInService.status() === AuthFlowStatus.Success) {
        this._signInService.reset();

        this.signInSucceeded.emit();
      }
    });
  }

  protected onSubmit() {
    if (this.signInForm.invalid) {
      this.signInForm.markAllAsTouched();
      return;
    }
    const signInFormValue = this.signInForm.getRawValue();
    this._signInService.signIn(signInFormValue);
  }

  protected getControlError(controlName: keyof SignInFormModel): string | undefined {
    if (!this.hasControlError(controlName)) {
      return undefined;
    }

    return this._getErrorMessage(this.signInForm.controls[controlName].errors!);
  }

  hasControlError(controlName: keyof SignInFormModel): boolean {
    const { errors, touched } = this.signInForm.controls[controlName];

    return !!errors && touched;
  }

  private _getErrorMessage(errors: ValidationErrors): string {
    if (errors['required']) {
      return 'Обязательное поле';
    }

    return 'Неверное значение';
  }
}

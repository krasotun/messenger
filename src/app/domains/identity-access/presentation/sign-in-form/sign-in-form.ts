import { Component, effect, inject, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

import { SignInService } from '../../application/sign-in/sign-in.service';

import { Button } from '@shared/ui/button/button';
import { FormField } from '@shared/ui/form-field/form-field';
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

  constructor() {
    effect(() => {
      if (this.isSubmitting()) {
        this.signInForm.disable({ emitEvent: false });
      } else {
        this.signInForm.enable({ emitEvent: false });
      }
    });

    this._signInService.succeeded$.pipe(takeUntilDestroyed()).subscribe(() => {
      this.signInSucceeded.emit();
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

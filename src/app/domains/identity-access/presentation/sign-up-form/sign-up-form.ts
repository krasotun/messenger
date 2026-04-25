import { Component, effect, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { SignUpService, SignUpStatus } from '@domains/identity-access/application/sign-up.service';
import {
  emailPattern,
  phonePattern,
} from '@domains/identity-access/presentation/sign-up-form/sign-up-form.constants';
import { Button } from '@shared/ui/button/button';
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
  imports: [Input, FormField, Button, ReactiveFormsModule],
  templateUrl: './sign-up-form.html',
  styleUrl: './sign-up-form.scss',
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

  private readonly _signUpService = inject(SignUpService);
  private readonly _router = inject(Router);

  protected readonly isSubmitting = this._signUpService.isSubmitting;
  protected readonly errorMessage = this._signUpService.errorMessage;

  constructor() {
    effect(() => {
      if (this._signUpService.status() === SignUpStatus.Success) {
        this._signUpService.resetSignUpStatus();

        this._router.navigate(['sign-in']);
      }
    });
  }

  protected onSubmit() {
    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      return;
    }
    const signUpFormValue = this.signUpForm.getRawValue();
    this._signUpService.signUp(signUpFormValue);
  }

  protected getControlError(controlName: keyof SignUpFormModel): string | undefined {
    if (!this.hasControlError(controlName)) {
      return undefined;
    }

    return this.getErrorMessage(this.signUpForm.controls[controlName].errors!);
  }

  hasControlError(controlName: keyof SignUpFormModel): boolean {
    const { errors, touched } = this.signUpForm.controls[controlName];

    return !!errors && touched;
  }

  private getErrorMessage(errors: ValidationErrors): string {
    if (errors['required']) {
      return 'Обязательное поле';
    }

    if (errors['minlength']) {
      return 'Меньше минимальной длины';
    }

    if (errors['maxlength']) {
      return 'Больше максимальной длины';
    }

    if (errors['pattern']) {
      return 'Неверный формат';
    }

    return 'Неверное значение';
  }
}

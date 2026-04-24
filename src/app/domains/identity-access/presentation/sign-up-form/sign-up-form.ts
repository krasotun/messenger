import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

import { SignUpService } from '@domains/identity-access/application/sign-up.service';
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
      validators: [Validators.required, Validators.pattern(phonePattern)],
    }),
  });

  protected readonly controls = this.signUpForm.controls;

  private readonly _signUpService = inject(SignUpService);

  protected onSubmit() {
    console.log('form submitted;');
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
    if (errors['pattern']) {
      return 'Неверный формат';
    }

    return 'Неверное значение';
  }
}

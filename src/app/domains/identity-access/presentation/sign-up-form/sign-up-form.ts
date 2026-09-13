import { Component, DestroyRef, inject, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { SignUpService } from '@domains/identity-access/application/sign-up/sign-up.service';
import {
  emailPattern,
  phonePattern,
} from '@domains/identity-access/presentation/sign-up-form/sign-up-form.constants';
import { createSubmitAvailability, lockFormWhileSubmitting } from '@shared/forms';
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

  readonly signUpSucceeded = output<void>();

  private readonly _destroyRef = inject(DestroyRef);

  private readonly _signUpService = inject(SignUpService);

  protected readonly isSubmitting = this._signUpService.isSubmitting;

  protected readonly canSubmit = createSubmitAvailability(this.signUpForm, this._destroyRef);

  constructor() {
    lockFormWhileSubmitting(this.signUpForm, this.isSubmitting);

    this._signUpService.succeeded$.pipe(takeUntilDestroyed()).subscribe(() => {
      this.signUpSucceeded.emit();
    });
  }

  protected onSubmit() {
    if (this.signUpForm.invalid) {
      return;
    }
    const signUpFormValue = this.signUpForm.getRawValue();
    this._signUpService.signUp(signUpFormValue);
  }
}

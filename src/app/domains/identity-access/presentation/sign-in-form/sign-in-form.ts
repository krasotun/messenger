import { Component, inject, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { SignInService } from '../../application/sign-in/sign-in.service';

import { createSubmitAvailability, lockFormWhileSubmitting } from '@shared/forms';
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

  protected readonly canSubmit = createSubmitAvailability(this.signInForm);

  constructor() {
    lockFormWhileSubmitting(this.signInForm, this.isSubmitting);

    this._signInService.succeeded$.pipe(takeUntilDestroyed()).subscribe(() => {
      this.signInSucceeded.emit();
    });
  }

  protected onSubmit() {
    if (this.signInForm.invalid) {
      return;
    }
    const signInFormValue = this.signInForm.getRawValue();
    this._signInService.signIn(signInFormValue);
  }
}

import { Component, inject, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

import { ChangePasswordService } from '../../application/change-password/change-password.service';

import { connectSubmitFlow } from '@shared/forms';
import { Form } from '@shared/ui/form/form';
import { FormField } from '@shared/ui/form-field/form-field';
import { Input } from '@shared/ui/input/input';

interface ChangePasswordFormModel {
  oldPassword: FormControl<string>;
  newPassword: FormControl<string>;
  repeatNewPassword: FormControl<string>;
}

const matchesNewPassword = (repeatNewPassword: AbstractControl): ValidationErrors | null => {
  const newPassword = repeatNewPassword.parent?.get('newPassword')?.value;

  return newPassword === repeatNewPassword.value ? null : { mismatch: true };
};

@Component({
  selector: 'app-change-password-form',
  imports: [Input, FormField, Form, ReactiveFormsModule],
  templateUrl: './change-password-form.html',
})
export class ChangePasswordForm {
  readonly changePasswordForm = new FormGroup<ChangePasswordFormModel>({
    oldPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    newPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    repeatNewPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, matchesNewPassword],
    }),
  });

  readonly passwordChanged = output<void>();

  private readonly _changePasswordService = inject(ChangePasswordService);

  protected readonly isSubmitting = this._changePasswordService.isSubmitting;

  protected readonly fields = [
    {
      label: 'Old password',
      type: 'password',
      control: this.changePasswordForm.controls.oldPassword,
    },
    {
      label: 'New password',
      type: 'password',
      control: this.changePasswordForm.controls.newPassword,
    },
  ];

  constructor() {
    connectSubmitFlow(this.changePasswordForm, this._changePasswordService, this.passwordChanged);

    this.changePasswordForm.controls.newPassword.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.changePasswordForm.controls.repeatNewPassword.updateValueAndValidity();
      });
  }

  protected onSubmit(): void {
    const { oldPassword, newPassword } = this.changePasswordForm.getRawValue();

    this._changePasswordService.changePassword({ oldPassword, newPassword });
  }
}

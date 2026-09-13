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

import { createSubmitAvailability, lockFormWhileSubmitting } from '@shared/forms';
import { Button } from '@shared/ui/button/button';
import { FormField } from '@shared/ui/form-field/form-field';
import { Input } from '@shared/ui/input/input';

interface ChangePasswordFormModel {
  oldPassword: FormControl<string>;
  newPassword: FormControl<string>;
  repeatNewPassword: FormControl<string>;
}

const repeatMatchesNewPassword = (changePasswordForm: AbstractControl): ValidationErrors | null => {
  const newPassword = changePasswordForm.get('newPassword')?.value;
  const repeatNewPassword = changePasswordForm.get('repeatNewPassword')?.value;

  return newPassword === repeatNewPassword ? null : { repeatMismatch: true };
};

@Component({
  selector: 'app-change-password-form',
  imports: [Input, FormField, Button, ReactiveFormsModule],
  templateUrl: './change-password-form.html',
  styleUrl: './change-password-form.scss',
})
export class ChangePasswordForm {
  readonly changePasswordForm = new FormGroup<ChangePasswordFormModel>(
    {
      oldPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      newPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      repeatNewPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    { validators: [repeatMatchesNewPassword] },
  );

  readonly passwordChanged = output<void>();

  private readonly _changePasswordService = inject(ChangePasswordService);

  protected readonly isSubmitting = this._changePasswordService.isSubmitting;

  protected readonly canSubmit = createSubmitAvailability(this.changePasswordForm);

  constructor() {
    lockFormWhileSubmitting(this.changePasswordForm, this.isSubmitting);

    this._changePasswordService.succeeded$.pipe(takeUntilDestroyed()).subscribe(() => {
      this.passwordChanged.emit();
    });
  }

  protected onSubmit() {
    if (this.changePasswordForm.invalid) {
      return;
    }

    const { oldPassword, newPassword } = this.changePasswordForm.getRawValue();

    this._changePasswordService.changePassword({ oldPassword, newPassword });
  }
}

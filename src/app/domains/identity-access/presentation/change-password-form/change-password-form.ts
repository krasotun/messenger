import { Component, effect, inject, output } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

import { AuthFlowStatus } from '../../application/auth-flow-status';
import { ChangePasswordService } from '../../application/change-password/change-password.service';

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
  protected readonly errorMessage = this._changePasswordService.errorMessage;

  constructor() {
    effect(() => {
      if (this.isSubmitting()) {
        this.changePasswordForm.disable({ emitEvent: false });
      } else {
        this.changePasswordForm.enable({ emitEvent: false });
      }
    });

    effect(() => {
      if (this._changePasswordService.status() === AuthFlowStatus.Success) {
        this._changePasswordService.reset();

        this.passwordChanged.emit();
      }
    });
  }

  protected onSubmit() {
    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }

    const { oldPassword, newPassword } = this.changePasswordForm.getRawValue();

    this._changePasswordService.changePassword({ oldPassword, newPassword });
  }

  protected getControlError(controlName: keyof ChangePasswordFormModel): string | undefined {
    if (!this.hasControlError(controlName)) {
      return undefined;
    }

    if (this._hasRepeatMismatch(controlName)) {
      return 'Пароли не совпадают';
    }

    return this._getErrorMessage(this.changePasswordForm.controls[controlName].errors!);
  }

  protected hasControlError(controlName: keyof ChangePasswordFormModel): boolean {
    const { errors, touched } = this.changePasswordForm.controls[controlName];

    return touched && (!!errors || this._hasRepeatMismatch(controlName));
  }

  private _hasRepeatMismatch(controlName: keyof ChangePasswordFormModel): boolean {
    return (
      controlName === 'repeatNewPassword' && !!this.changePasswordForm.errors?.['repeatMismatch']
    );
  }

  private _getErrorMessage(errors: ValidationErrors): string {
    if (errors['required']) {
      return 'Обязательное поле';
    }

    return 'Неверное значение';
  }
}

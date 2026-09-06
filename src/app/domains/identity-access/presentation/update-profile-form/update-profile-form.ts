import { Component, effect, inject, output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

import { AuthFlowStatus } from '../../application/auth-flow-status.type';
import { UpdateProfileService } from '../../application/update-profile/update-profile.service';
import { emailPattern, phonePattern } from '../sign-up-form/sign-up-form.constants';

import { Button } from '@shared/ui/button/button';
import { FormField } from '@shared/ui/form-field/form-field';
import { Input } from '@shared/ui/input/input';

interface UpdateProfileFormModel {
  firstName: FormControl<string>;
  secondName: FormControl<string>;
  displayName: FormControl<string>;
  login: FormControl<string>;
  email: FormControl<string>;
  phone: FormControl<string>;
}

@Component({
  selector: 'app-update-profile-form',
  imports: [Input, FormField, Button, ReactiveFormsModule],
  templateUrl: './update-profile-form.html',
  styleUrl: './update-profile-form.scss',
})
export class UpdateProfileForm {
  readonly updateProfileForm = new FormGroup<UpdateProfileFormModel>({
    firstName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    secondName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    displayName: new FormControl('', { nonNullable: true }),
    login: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(emailPattern)],
    }),
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

  readonly profileUpdated = output<void>();

  private readonly _updateProfileService = inject(UpdateProfileService);

  protected readonly isSubmitting = this._updateProfileService.isSubmitting;
  protected readonly errorMessage = this._updateProfileService.errorMessage;

  constructor() {
    this.updateProfileForm.setValue(this._updateProfileService.initialValues());

    effect(() => {
      if (this.isSubmitting()) {
        this.updateProfileForm.disable({ emitEvent: false });
      } else {
        this.updateProfileForm.enable({ emitEvent: false });
      }
    });

    effect(() => {
      if (this._updateProfileService.status() === AuthFlowStatus.Success) {
        this._updateProfileService.reset();

        this.profileUpdated.emit();
      }
    });
  }

  protected onSubmit() {
    if (this.updateProfileForm.invalid) {
      this.updateProfileForm.markAllAsTouched();
      return;
    }
    const updateProfileFormValue = this.updateProfileForm.getRawValue();
    this._updateProfileService.updateProfile(updateProfileFormValue);
  }

  protected getControlError(controlName: keyof UpdateProfileFormModel): string | undefined {
    if (!this.hasControlError(controlName)) {
      return undefined;
    }

    return this._getErrorMessage(this.updateProfileForm.controls[controlName].errors!);
  }

  protected hasControlError(controlName: keyof UpdateProfileFormModel): boolean {
    const { errors, touched } = this.updateProfileForm.controls[controlName];

    return !!errors && touched;
  }

  private _getErrorMessage(errors: ValidationErrors): string {
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

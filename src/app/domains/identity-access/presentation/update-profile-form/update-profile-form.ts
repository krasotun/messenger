import { Component, inject, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { UpdateProfileService } from '../../application/update-profile/update-profile.service';
import { emailPattern, phonePattern } from '../sign-up-form/sign-up-form.constants';

import { createSubmitAvailability, lockFormWhileSubmitting } from '@shared/forms';
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

  protected readonly canSubmit = createSubmitAvailability(this.updateProfileForm, {
    requireChanges: true,
  });

  constructor() {
    this.updateProfileForm.setValue(this._updateProfileService.initialValues());

    lockFormWhileSubmitting(this.updateProfileForm, this.isSubmitting);

    this._updateProfileService.succeeded$.pipe(takeUntilDestroyed()).subscribe(() => {
      this.profileUpdated.emit();
    });
  }

  protected onSubmit() {
    if (this.updateProfileForm.invalid) {
      return;
    }
    const updateProfileFormValue = this.updateProfileForm.getRawValue();
    this._updateProfileService.updateProfile(updateProfileFormValue);
  }
}

import { Component, inject, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { UpdateProfileService } from '../../application/update-profile/update-profile.service';
import { emailPattern, phonePattern } from '../sign-up-form/sign-up-form.constants';

import { connectSubmitFlow } from '@shared/forms';
import { Form } from '@shared/ui/form/form';
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
  imports: [Input, FormField, Form, ReactiveFormsModule],
  templateUrl: './update-profile-form.html',
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

  protected readonly fields = [
    { label: 'First name', type: 'text', control: this.updateProfileForm.controls.firstName },
    { label: 'Second name', type: 'text', control: this.updateProfileForm.controls.secondName },
    { label: 'Display name', type: 'text', control: this.updateProfileForm.controls.displayName },
    { label: 'Login', type: 'text', control: this.updateProfileForm.controls.login },
    { label: 'Email', type: 'email', control: this.updateProfileForm.controls.email },
    { label: 'Mobile phone', type: 'text', control: this.updateProfileForm.controls.phone },
  ];

  constructor() {
    this.updateProfileForm.setValue(this._updateProfileService.initialValues());

    connectSubmitFlow(this.updateProfileForm, this._updateProfileService, this.profileUpdated);
  }

  protected onSubmit(): void {
    const updateProfileFormValue = this.updateProfileForm.getRawValue();
    this._updateProfileService.updateProfile(updateProfileFormValue);
  }
}

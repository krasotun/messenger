import { Component, effect, inject, input, output, signal } from '@angular/core';
import { apply, form, required } from '@angular/forms/signals';

import { CurrentSessionStore } from '../../data/current-session-store';
import { emailSchema, phoneSchema } from '../../data/user-field-schemas';
import { UpdateProfileInput } from '../../data/user-gateway';

import { connectSubmitFlow, lockFormWhileSubmitting } from '@shared/forms';
import { createFormSubmitFlowState } from '@shared/submit-flow';
import { Form } from '@shared/ui/form/form';
import { FormTextField } from '@shared/ui/form/form-text-field';

@Component({
  selector: 'app-update-profile-form',
  imports: [Form],
  templateUrl: './update-profile-form.html',
})
export class UpdateProfileForm {
  readonly profile = input.required<UpdateProfileInput>();

  readonly profileUpdated = output<void>();

  private readonly _currentSessionStore = inject(CurrentSessionStore);

  private readonly _updateProfileFlow = createFormSubmitFlowState();

  // Не `linkedSignal` от `profile`: `form()` читает модель при создании, когда
  // обязательный input еще не получил значение.
  private readonly _updateProfileValue = signal<UpdateProfileInput>({
    firstName: '',
    secondName: '',
    displayName: '',
    login: '',
    email: '',
    phone: '',
  });

  readonly updateProfileForm = form(this._updateProfileValue, (path) => {
    required(path.firstName);
    required(path.secondName);
    required(path.login);
    apply(path.email, emailSchema);
    apply(path.phone, phoneSchema);
    lockFormWhileSubmitting(path, this._updateProfileFlow.isSubmitting);
  });

  protected readonly isSubmitting = this._updateProfileFlow.isSubmitting;

  protected readonly fields: FormTextField[] = [
    { label: 'First name', type: 'text', field: this.updateProfileForm.firstName },
    { label: 'Second name', type: 'text', field: this.updateProfileForm.secondName },
    { label: 'Display name', type: 'text', field: this.updateProfileForm.displayName },
    { label: 'Login', type: 'text', field: this.updateProfileForm.login },
    { label: 'Email', type: 'email', field: this.updateProfileForm.email },
    { label: 'Mobile phone', type: 'text', field: this.updateProfileForm.phone },
  ];

  constructor() {
    effect(() => {
      this._updateProfileValue.set(this.profile());
    });

    connectSubmitFlow(this._updateProfileFlow, this.profileUpdated);
  }

  protected onSubmit(): void {
    this._currentSessionStore.updateProfile(this._updateProfileValue(), this._updateProfileFlow);
  }
}

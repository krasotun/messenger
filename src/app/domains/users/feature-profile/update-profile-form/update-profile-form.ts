import { Component, effect, inject, input, output, signal } from '@angular/core';

import { CurrentSessionStore } from '../../data/current-session-store';
import { UpdateProfileInput } from '../../data/user-gateway';
import { userFieldsSchema } from '../../ui/user-fields-schema';

import { createSubmitFlowForm } from '@shared/forms';
import { createFormSubmitFlowState } from '@shared/submit-flow';
import { Form } from '@shared/ui/form/form';
import { TextFieldConfig } from '@shared/ui/text-field/text-field-config.type';

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

  readonly updateProfileForm = createSubmitFlowForm({
    value: this._updateProfileValue,
    schema: userFieldsSchema,
    flow: this._updateProfileFlow,
    succeeded: this.profileUpdated,
  });

  protected readonly isSubmitting = this._updateProfileFlow.isSubmitting;

  protected readonly fields: TextFieldConfig[] = [
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
  }

  protected onSubmit(): void {
    this._currentSessionStore.updateProfile(this._updateProfileValue(), this._updateProfileFlow);
  }
}

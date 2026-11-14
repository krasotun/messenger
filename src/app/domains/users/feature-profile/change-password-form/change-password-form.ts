import { Component, inject, output, signal } from '@angular/core';
import { form, FormField as FormFieldDirective, required, validate } from '@angular/forms/signals';

import { CurrentSessionStore } from '../../data/current-session-store';

import { connectSubmitFlow, lockFormWhileSubmitting } from '@shared/forms';
import { createFormSubmitFlowState } from '@shared/submit-flow';
import { Form } from '@shared/ui/form/form';
import { FormTextField } from '@shared/ui/form/form-text-field';
import { FormField } from '@shared/ui/form-field/form-field';
import { Input } from '@shared/ui/input/input';

@Component({
  selector: 'app-change-password-form',
  imports: [Input, FormField, FormFieldDirective, Form],
  templateUrl: './change-password-form.html',
})
export class ChangePasswordForm {
  readonly passwordChanged = output<void>();

  private readonly _currentSessionStore = inject(CurrentSessionStore);

  private readonly _changePasswordFlow = createFormSubmitFlowState();

  private readonly _changePasswordValue = signal({
    oldPassword: '',
    newPassword: '',
    repeatNewPassword: '',
  });

  readonly changePasswordForm = form(this._changePasswordValue, (path) => {
    required(path.oldPassword);
    required(path.newPassword);
    required(path.repeatNewPassword);
    validate(path.repeatNewPassword, ({ value, valueOf }) =>
      value() === valueOf(path.newPassword) ? null : { kind: 'mismatch' },
    );
    lockFormWhileSubmitting(path, this._changePasswordFlow.isSubmitting);
  });

  protected readonly isSubmitting = this._changePasswordFlow.isSubmitting;

  protected readonly fields: FormTextField[] = [
    { label: 'Old password', type: 'password', field: this.changePasswordForm.oldPassword },
    { label: 'New password', type: 'password', field: this.changePasswordForm.newPassword },
  ];

  constructor() {
    connectSubmitFlow(this._changePasswordFlow, this.passwordChanged);
  }

  protected onSubmit(): void {
    const { oldPassword, newPassword } = this._changePasswordValue();

    this._currentSessionStore.changePassword(
      { oldPassword, newPassword },
      this._changePasswordFlow,
    );
  }
}

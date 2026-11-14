import { Component, inject, output, signal } from '@angular/core';
import { required } from '@angular/forms/signals';

import { CurrentSessionStore } from '../../data/current-session-store';

import { createSubmitFlowForm, validateMatch } from '@shared/forms';
import { createFormSubmitFlowState } from '@shared/submit-flow';
import { Form } from '@shared/ui/form/form';
import { TextField } from '@shared/ui/text-field/text-field';
import { TextFieldConfig } from '@shared/ui/text-field/text-field-config.type';

@Component({
  selector: 'app-change-password-form',
  imports: [Form, TextField],
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

  readonly changePasswordForm = createSubmitFlowForm({
    value: this._changePasswordValue,
    schema: (path) => {
      required(path.oldPassword);
      required(path.newPassword);
      required(path.repeatNewPassword);
      validateMatch(path.repeatNewPassword, path.newPassword);
    },
    flow: this._changePasswordFlow,
    succeeded: this.passwordChanged,
  });

  protected readonly isSubmitting = this._changePasswordFlow.isSubmitting;

  protected readonly fields: TextFieldConfig[] = [
    { label: 'Old password', type: 'password', field: this.changePasswordForm.oldPassword },
    { label: 'New password', type: 'password', field: this.changePasswordForm.newPassword },
  ];

  protected onSubmit(): void {
    const { oldPassword, newPassword } = this._changePasswordValue();

    this._currentSessionStore.changePassword(
      { oldPassword, newPassword },
      this._changePasswordFlow,
    );
  }
}

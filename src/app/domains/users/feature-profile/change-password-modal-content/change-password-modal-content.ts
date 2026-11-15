import { Component, inject } from '@angular/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

import { ChangePasswordForm } from '../change-password-form/change-password-form';

@Component({
  selector: 'app-change-password-modal-content',
  imports: [ChangePasswordForm],
  templateUrl: './change-password-modal-content.html',
})
export class ChangePasswordModalContent {
  private readonly _dialogRef = inject(DynamicDialogRef);

  protected closeModal(): void {
    this._dialogRef.close();
  }
}

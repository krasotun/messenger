import { Component, inject } from '@angular/core';

import { ChangePasswordForm } from '../change-password-form/change-password-form';

import { ModalRef } from '@shared/ui/modal/modal-ref';

@Component({
  selector: 'app-change-password-modal-content',
  imports: [ChangePasswordForm],
  templateUrl: './change-password-modal-content.html',
})
export class ChangePasswordModalContent {
  private readonly _modalRef = inject(ModalRef);

  protected closeModal(): void {
    this._modalRef.close();
  }
}

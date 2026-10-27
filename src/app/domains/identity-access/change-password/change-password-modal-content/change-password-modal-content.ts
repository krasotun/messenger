import { Component, inject } from '@angular/core';

import { ChangePasswordForm } from '../change-password-form/change-password-form';
import { ChangePasswordService } from '../change-password.service';

import { ModalRef } from '@shared/ui/modal/modal-ref';

@Component({
  selector: 'app-change-password-modal-content',
  imports: [ChangePasswordForm],
  templateUrl: './change-password-modal-content.html',
  providers: [ChangePasswordService],
})
export class ChangePasswordModalContent {
  private readonly _modalRef = inject(ModalRef);

  protected closeModal(): void {
    this._modalRef.close();
  }
}

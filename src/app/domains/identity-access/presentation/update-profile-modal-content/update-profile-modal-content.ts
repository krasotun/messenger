import { Component, inject } from '@angular/core';

import { UpdateProfileForm } from '../update-profile-form/update-profile-form';

import { ModalRef } from '@shared/ui/modal/modal-ref';

@Component({
  selector: 'app-update-profile-modal-content',
  imports: [UpdateProfileForm],
  templateUrl: './update-profile-modal-content.html',
})
export class UpdateProfileModalContent {
  private readonly _modalRef = inject(ModalRef);

  protected closeModal(): void {
    this._modalRef.close();
  }
}

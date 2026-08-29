import { Component, inject } from '@angular/core';

import { UpdateProfileService } from '../../application/update-profile/update-profile.service';
import { UpdateProfileForm } from '../update-profile-form/update-profile-form';

import { ModalRef } from '@shared/ui/modal/modal-ref';

@Component({
  selector: 'app-update-profile-modal-content',
  imports: [UpdateProfileForm],
  templateUrl: './update-profile-modal-content.html',
  providers: [UpdateProfileService],
})
export class UpdateProfileModalContent {
  private readonly _modalRef = inject(ModalRef);

  protected closeModal(): void {
    this._modalRef.close();
  }
}

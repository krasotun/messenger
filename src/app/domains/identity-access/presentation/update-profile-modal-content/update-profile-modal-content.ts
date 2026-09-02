import { Component, inject } from '@angular/core';

import { ChangeAvatarService } from '../../application/change-avatar/change-avatar.service';
import { UpdateProfileService } from '../../application/update-profile/update-profile.service';
import { ChangeAvatarForm } from '../change-avatar-form/change-avatar-form';
import { UpdateProfileForm } from '../update-profile-form/update-profile-form';

import { ModalRef } from '@shared/ui/modal/modal-ref';

@Component({
  selector: 'app-update-profile-modal-content',
  imports: [ChangeAvatarForm, UpdateProfileForm],
  templateUrl: './update-profile-modal-content.html',
  providers: [UpdateProfileService, ChangeAvatarService],
})
export class UpdateProfileModalContent {
  private readonly _modalRef = inject(ModalRef);

  protected closeModal(): void {
    this._modalRef.close();
  }
}

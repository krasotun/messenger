import { Component, inject } from '@angular/core';

import { ChangeAvatarForm } from '../../change-avatar/change-avatar-form/change-avatar-form';
import { ChangeAvatarService } from '../../change-avatar/change-avatar.service';
import { UpdateProfileForm } from '../update-profile-form/update-profile-form';
import { UpdateProfileService } from '../update-profile.service';

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

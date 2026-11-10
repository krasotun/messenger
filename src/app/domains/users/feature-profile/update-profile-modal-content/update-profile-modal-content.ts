import { Component, computed, inject, input } from '@angular/core';

import { CurrentUser } from '../../data/current-user';
import { UpdateProfileInput } from '../../data/user-gateway';
import { ChangeAvatarForm } from '../change-avatar-form/change-avatar-form';
import { UpdateProfileForm } from '../update-profile-form/update-profile-form';

import { ModalRef } from '@shared/ui/modal/modal-ref';

@Component({
  selector: 'app-update-profile-modal-content',
  imports: [ChangeAvatarForm, UpdateProfileForm],
  templateUrl: './update-profile-modal-content.html',
})
export class UpdateProfileModalContent {
  readonly currentUser = input.required<CurrentUser>();

  protected readonly profile = computed<UpdateProfileInput>(() => {
    const { firstName, secondName, displayName, login, email, phone } = this.currentUser();

    return {
      firstName,
      secondName,
      displayName: displayName ?? '',
      login,
      email,
      phone,
    };
  });

  private readonly _modalRef = inject(ModalRef);

  protected closeModal(): void {
    this._modalRef.close();
  }
}

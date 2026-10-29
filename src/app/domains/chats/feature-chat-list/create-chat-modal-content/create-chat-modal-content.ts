import { Component, inject } from '@angular/core';

import { CreateChatForm } from '../create-chat-form/create-chat-form';

import { ModalRef } from '@shared/ui/modal/modal-ref';

@Component({
  selector: 'app-create-chat-modal-content',
  imports: [CreateChatForm],
  templateUrl: './create-chat-modal-content.html',
})
export class CreateChatModalContent {
  private readonly _modalRef = inject(ModalRef);

  protected closeModal(): void {
    this._modalRef.close();
  }
}

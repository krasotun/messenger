import { Component, inject, input } from '@angular/core';
import { ButtonDirective } from 'primeng/button';

import { ConfirmationData } from '../confirmation-data.type';

import { ModalRef } from '@shared/ui/modal/modal-ref';

@Component({
  selector: 'app-confirmation-dialog',
  imports: [ButtonDirective],
  templateUrl: './confirmation-dialog.html',
  styleUrl: './confirmation-dialog.scss',
})
export class ConfirmationDialog {
  readonly data = input.required<ConfirmationData>();

  private readonly _modalRef = inject(ModalRef);

  protected confirm(): void {
    this._modalRef.close(true);
  }

  protected cancel(): void {
    this._modalRef.close(false);
  }
}

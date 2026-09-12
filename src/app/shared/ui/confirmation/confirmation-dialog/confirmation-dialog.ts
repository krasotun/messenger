import { Component, inject, input } from '@angular/core';

import { ConfirmationData } from '../confirmation-data.type';

import { Button } from '@shared/ui/button/button';
import { ModalRef } from '@shared/ui/modal/modal-ref';

@Component({
  selector: 'app-confirmation-dialog',
  imports: [Button],
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

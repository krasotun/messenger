import { inject, Injectable } from '@angular/core';
import { map, Observable, of, take } from 'rxjs';

import { ConfirmationData } from './confirmation-data.type';
import { ConfirmationDialog } from './confirmation-dialog/confirmation-dialog';

import { ModalService } from '@shared/ui/modal/modal-service';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationService {
  private readonly _modalService = inject(ModalService);

  confirm(data: ConfirmationData): Observable<boolean> {
    const modalRef = this._modalService.open(ConfirmationDialog, {
      title: data.title,
      size: 'small',
      inputs: { data },
    });

    if (!modalRef) {
      return of(false);
    }

    return modalRef.closed$.pipe(
      take(1),
      map((result) => result ?? false),
    );
  }
}

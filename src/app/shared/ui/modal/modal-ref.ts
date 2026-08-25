import { Subject } from 'rxjs';

export class ModalRef {
  readonly closeRequested$ = new Subject<void>();

  close(): void {
    this.closeRequested$.next();
  }
}

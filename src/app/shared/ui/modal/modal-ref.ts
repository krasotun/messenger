import { Observable, Subject } from 'rxjs';

export class ModalRef {
  readonly closeRequested$ = new Subject<void>();

  private readonly _closed$ = new Subject<boolean | undefined>();

  private _result: boolean | undefined;

  readonly closed$: Observable<boolean | undefined> = this._closed$.asObservable();

  close(result?: boolean): void {
    this._result = result;
    this.closeRequested$.next();
  }

  notifyClosed(): void {
    this._closed$.next(this._result);
    this._closed$.complete();
  }
}

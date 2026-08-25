import { CdkTrapFocus } from '@angular/cdk/a11y';
import { CdkPortalOutlet, ComponentPortal, PortalModule } from '@angular/cdk/portal';
import {
  AfterViewInit,
  Component,
  ComponentRef,
  inject,
  input,
  Type,
  viewChild,
} from '@angular/core';

import { ModalRef } from '../modal-ref';

@Component({
  selector: 'app-modal-shell',
  imports: [PortalModule, CdkTrapFocus],
  templateUrl: './modal-shell.html',
  styleUrl: './modal-shell.scss',
})
export class ModalShell implements AfterViewInit {
  readonly content = input.required<Type<unknown>>();

  readonly contentInputs = input<Record<string, unknown>>({});

  private readonly _modalRef = inject(ModalRef);

  private readonly _portalOutlet = viewChild.required(CdkPortalOutlet);

  ngAfterViewInit(): void {
    const contentPortal = new ComponentPortal(this.content());
    const contentRef = this._portalOutlet().attach(contentPortal);

    this._applyContentInputs(contentRef);
  }

  close(): void {
    this._modalRef.close();
  }

  private _applyContentInputs(contentRef: ComponentRef<unknown>): void {
    for (const [inputName, inputValue] of Object.entries(this.contentInputs())) {
      contentRef.setInput(inputName, inputValue);
    }
  }
}

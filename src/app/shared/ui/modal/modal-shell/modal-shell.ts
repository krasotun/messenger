import { CdkPortalOutlet, ComponentPortal, PortalModule } from '@angular/cdk/portal';
import { AfterViewInit, Component, inject, input, Type, ViewChild } from '@angular/core';

import { ModalRef } from '../modal-ref';

@Component({
  selector: 'app-modal-shell',
  imports: [PortalModule],
  templateUrl: './modal-shell.html',
  styleUrl: './modal-shell.scss',
})
export class ModalShell implements AfterViewInit {
  readonly content = input.required<Type<unknown>>();

  readonly contentInputs = input<Record<string, unknown>>({});

  private readonly _modalRef = inject(ModalRef);

  @ViewChild(CdkPortalOutlet, { static: true })
  private readonly _portalOutlet!: CdkPortalOutlet;

  ngAfterViewInit(): void {
    const contentPortal = new ComponentPortal(this.content());
    const contentRef = this._portalOutlet.attach(contentPortal);

    for (const [inputName, inputValue] of Object.entries(this.contentInputs())) {
      contentRef.setInput(inputName, inputValue);
    }
  }

  close(): void {
    this._modalRef.close();
  }
}

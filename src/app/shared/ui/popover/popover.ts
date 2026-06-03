import { Directive, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appPopover]',
  host: {
    '(click)': 'onClick()',
  },
})
export class Popover {
  readonly content = input.required<TemplateRef<unknown>>({ alias: 'appPopover' });

  private readonly _viewContainerRef = inject(ViewContainerRef);

  onClick() {
    this._viewContainerRef.createEmbeddedView(this.content());
  }
}

import { Directive, input } from '@angular/core';

type ButtonColorType = 'primary' | 'secondary' | 'success' | 'danger' | 'warning';

@Directive({
  selector: 'button[appButton]',
  host: {
    '[class.disabled]': 'disabled()',
    '[class]': '`button-${colorType()}`',
  },
})
export class Button {
  readonly colorType = input<ButtonColorType>('primary');
  readonly disabled = input(false);
}

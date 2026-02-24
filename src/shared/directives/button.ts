import { Directive, input } from '@angular/core';

type ButtonColorType = 'primary' | 'secondary' | 'success' | 'danger' | 'warning';

@Directive({
  selector: '[appButton]',
  host: {
    '[class.disabled]': 'disabled()',
    '[class]': '`colorType-${colorType()}`',
  },
})
export class Button {
  readonly colorType = input<ButtonColorType>('primary');
  readonly disabled = input(false);
}

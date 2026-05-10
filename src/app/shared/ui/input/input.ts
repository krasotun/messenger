import { Directive, input } from '@angular/core';

@Directive({
  selector: 'input[appInput]',
  host: {
    '[attr.aria-invalid]': 'invalid()',
    '[disabled]': 'disabled()',
  },
})
export class Input {
  readonly invalid = input<boolean>(false);
  readonly disabled = input<boolean>(false);
}

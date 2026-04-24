import { Directive, input } from '@angular/core';

@Directive({
  selector: 'input[appInput]',
  host: {
    '[attr.aria-invalid]': 'invalid()',
  },
})
export class Input {
  readonly invalid = input<boolean>(false);
}

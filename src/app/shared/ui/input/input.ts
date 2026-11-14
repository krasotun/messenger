import { computed, Directive, inject } from '@angular/core';
import { FormField } from '@angular/forms/signals';

import { isViolationVisible } from '@shared/forms';

@Directive({
  selector: 'input[appInput]',
  host: {
    '[attr.aria-invalid]': 'invalid()',
  },
})
export class Input {
  private readonly _formField = inject(FormField, { optional: true, self: true });

  readonly invalid = computed(() => {
    const state = this._formField?.state();

    return state ? isViolationVisible(state) : false;
  });
}

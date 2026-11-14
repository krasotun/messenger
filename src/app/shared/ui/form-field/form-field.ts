import { Component, computed, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';

import { isViolationVisible, resolveControlError } from '@shared/forms';

@Component({
  selector: 'app-form-field',
  imports: [],
  templateUrl: './form-field.html',
  styleUrl: './form-field.scss',
})
export class FormField {
  readonly label = input.required<string>();
  readonly field = input.required<FieldTree<unknown>>();

  protected readonly message = computed(() => {
    const state = this.field()();

    return isViolationVisible(state) ? resolveControlError(state.errors()) : undefined;
  });
}

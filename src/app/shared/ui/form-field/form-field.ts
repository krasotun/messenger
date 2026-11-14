import { Component, computed, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';

import { isViolationVisible, resolveViolationMessage } from '@shared/forms';

@Component({
  selector: 'app-form-field',
  imports: [],
  templateUrl: './form-field.html',
  styleUrl: './form-field.scss',
})
export class FormField {
  readonly label = input.required<string>();
  readonly field = input.required<FieldTree<unknown>>();

  private readonly _fieldState = computed(() => {
    const fieldTree = this.field();

    return fieldTree();
  });

  protected readonly message = computed(() => {
    const fieldState = this._fieldState();

    return isViolationVisible(fieldState)
      ? resolveViolationMessage(fieldState.errors())
      : undefined;
  });
}

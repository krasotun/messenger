import { Component, computed, input, output } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';

import { Button } from '@shared/ui/button/button';
import { TextField } from '@shared/ui/text-field/text-field';
import { TextFieldConfig } from '@shared/ui/text-field/text-field-config.type';

@Component({
  selector: 'app-form',
  imports: [Button, TextField],
  templateUrl: './form.html',
  styleUrl: './form.scss',
})
export class Form {
  readonly form = input.required<FieldTree<unknown>>();
  readonly submitLabel = input.required<string>();
  readonly fields = input<TextFieldConfig[]>([]);
  readonly requireChanges = input(false);
  readonly isSubmitting = input(false);

  readonly submitted = output<void>();

  private readonly _formState = computed(() => {
    const formTree = this.form();

    return formTree();
  });

  private readonly _canSubmit = computed(() => {
    const formState = this._formState();

    return formState.valid() && (!this.requireChanges() || formState.dirty());
  });

  protected readonly disabled = computed(() => this.isSubmitting() || !this._canSubmit());

  // Свой обработчик вместо `FormRoot` и `submit()`: те помечают все поля
  // тронутыми при отправке невалидной формы, а у нас сообщение о нарушении
  // появляется только после ухода с поля.
  protected onSubmit(event: Event): void {
    event.preventDefault();

    if (this._formState().invalid()) {
      return;
    }

    this.submitted.emit();
  }
}

import { Component, computed, input, output } from '@angular/core';
import { FieldTree, FormField as FormFieldDirective } from '@angular/forms/signals';

import { FormTextField } from './form-text-field';

import { Button } from '@shared/ui/button/button';
import { FormField } from '@shared/ui/form-field/form-field';
import { Input } from '@shared/ui/input/input';

@Component({
  selector: 'app-form',
  imports: [Button, FormField, FormFieldDirective, Input],
  templateUrl: './form.html',
  styleUrl: './form.scss',
})
export class Form {
  readonly form = input.required<FieldTree<unknown>>();
  readonly submitLabel = input.required<string>();
  readonly fields = input<FormTextField[]>([]);
  readonly requireChanges = input(false);
  readonly isSubmitting = input(false);

  readonly submitted = output<void>();

  private readonly _canSubmit = computed(() => {
    const state = this.form()();

    return state.valid() && (!this.requireChanges() || state.dirty());
  });

  protected readonly disabled = computed(() => this.isSubmitting() || !this._canSubmit());

  // Свой обработчик вместо `FormRoot` и `submit()`: те помечают все поля
  // тронутыми при отправке невалидной формы, а у нас сообщение о нарушении
  // появляется только после ухода с поля.
  protected onSubmit(event: Event): void {
    event.preventDefault();

    if (this.form()().invalid()) {
      return;
    }

    this.submitted.emit();
  }
}

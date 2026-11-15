import { Component, computed, input } from '@angular/core';
// Директива Angular зовется так же, как наш примитив поля; псевдоним живет
// только здесь - остальной код берет готовое текстовое поле.
import { FieldTree, FormField as FormFieldDirective } from '@angular/forms/signals';
import { InputText } from 'primeng/inputtext';

import { TextFieldType } from './text-field-config.type';

import { isViolationVisible } from '@shared/forms';
import { FormField } from '@shared/ui/form-field/form-field';

@Component({
  selector: 'app-text-field',
  imports: [FormField, FormFieldDirective, InputText],
  template: `
    <app-form-field [label]="label()" [field]="field()">
      <input
        [formField]="field()"
        pInputText
        [fluid]="true"
        [type]="type()"
        [class.p-invalid]="invalid()"
        [attr.aria-invalid]="invalid()"
      />
    </app-form-field>
  `,
})
export class TextField {
  readonly label = input.required<string>();
  readonly field = input.required<FieldTree<string>>();
  readonly type = input<TextFieldType>('text');

  // Свой признак вместо того, что ставит [formField]: тот помечает поле сразу,
  // а нарушение показывается только после ухода с поля. Вход [invalid] кита
  // занят [formField], поэтому рамку кита включает класс p-invalid.
  protected readonly invalid = computed(() => {
    const fieldTree = this.field();

    return isViolationVisible(fieldTree());
  });
}

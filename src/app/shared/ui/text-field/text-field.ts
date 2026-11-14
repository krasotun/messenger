import { Component, input } from '@angular/core';
// Директива Angular зовется так же, как наш примитив поля; псевдоним живет
// только здесь - остальной код берет готовое текстовое поле.
import { FieldTree, FormField as FormFieldDirective } from '@angular/forms/signals';

import { TextFieldType } from './text-field-config.type';

import { FormField } from '@shared/ui/form-field/form-field';
import { Input } from '@shared/ui/input/input';

@Component({
  selector: 'app-text-field',
  imports: [FormField, FormFieldDirective, Input],
  template: `
    <app-form-field [label]="label()" [field]="field()">
      <input [formField]="field()" appInput [type]="type()" />
    </app-form-field>
  `,
})
export class TextField {
  readonly label = input.required<string>();
  readonly field = input.required<FieldTree<string>>();
  readonly type = input<TextFieldType>('text');
}

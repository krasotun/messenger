import { FieldTree } from '@angular/forms/signals';

export type TextFieldType = 'text' | 'email' | 'password';

export interface TextFieldConfig {
  label: string;
  type: TextFieldType;
  field: FieldTree<string>;
}

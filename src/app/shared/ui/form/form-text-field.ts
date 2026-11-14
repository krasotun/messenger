import { FieldTree } from '@angular/forms/signals';

export interface FormTextField {
  label: string;
  type: 'text' | 'email' | 'password';
  field: FieldTree<string>;
}

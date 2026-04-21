import { Component } from '@angular/core';

import { FormField } from '@shared/ui/form-field/form-field';
import { Input } from '@shared/ui/input/input';

@Component({
  selector: 'app-sign-up-form',
  imports: [Input, FormField],
  templateUrl: './sign-up-form.html',
  styleUrl: './sign-up-form.scss',
})
export class SignUpForm {}

import { Component, inject, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { CreateChatService } from '../../application/create-chat/create-chat.service';

import { connectSubmitFlow } from '@shared/forms';
import { Form } from '@shared/ui/form/form';
import { FormField } from '@shared/ui/form-field/form-field';
import { Input } from '@shared/ui/input/input';

interface CreateChatFormModel {
  title: FormControl<string>;
}

@Component({
  selector: 'app-create-chat-form',
  imports: [Input, FormField, Form, ReactiveFormsModule],
  templateUrl: './create-chat-form.html',
})
export class CreateChatForm {
  readonly createChatForm = new FormGroup<CreateChatFormModel>({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  readonly chatCreated = output<void>();

  private readonly _createChatService = inject(CreateChatService);

  protected readonly isSubmitting = this._createChatService.isSubmitting;

  protected readonly fields = [
    { label: 'Title', type: 'text', control: this.createChatForm.controls.title },
  ];

  constructor() {
    connectSubmitFlow(this.createChatForm, this._createChatService, this.chatCreated);
  }

  protected onSubmit(): void {
    const { title } = this.createChatForm.getRawValue();

    this._createChatService.createChat({ title });
  }
}

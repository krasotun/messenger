import { Component, inject, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { ChatListStore } from '@domains/chats/data/chat-list-store';
import { connectSubmitFlow } from '@shared/forms';
import { createFormSubmitFlowState } from '@shared/submit-flow';
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

  private readonly _chatListStore = inject(ChatListStore);

  private readonly _chatCreationFlow = createFormSubmitFlowState();

  protected readonly isSubmitting = this._chatCreationFlow.isSubmitting;

  protected readonly fields = [
    { label: 'Title', type: 'text', control: this.createChatForm.controls.title },
  ];

  constructor() {
    connectSubmitFlow(this.createChatForm, this._chatCreationFlow, this.chatCreated);
  }

  protected onSubmit(): void {
    const { title } = this.createChatForm.getRawValue();

    this._chatListStore.createChat({ title }, this._chatCreationFlow);
  }
}

import { Component, inject, output, signal } from '@angular/core';
import { form, required } from '@angular/forms/signals';

import { ChatListStore } from '@domains/chats/data/chat-list-store';
import { connectSubmitFlow, lockFormWhileSubmitting } from '@shared/forms';
import { createFormSubmitFlowState } from '@shared/submit-flow';
import { Form } from '@shared/ui/form/form';
import { FormTextField } from '@shared/ui/form/form-text-field';

@Component({
  selector: 'app-create-chat-form',
  imports: [Form],
  templateUrl: './create-chat-form.html',
})
export class CreateChatForm {
  readonly chatCreated = output<void>();

  private readonly _chatListStore = inject(ChatListStore);

  private readonly _chatCreationFlow = createFormSubmitFlowState();

  private readonly _createChatValue = signal({ title: '' });

  readonly createChatForm = form(this._createChatValue, (path) => {
    required(path.title);
    lockFormWhileSubmitting(path, this._chatCreationFlow.isSubmitting);
  });

  protected readonly isSubmitting = this._chatCreationFlow.isSubmitting;

  protected readonly fields: FormTextField[] = [
    { label: 'Title', type: 'text', field: this.createChatForm.title },
  ];

  constructor() {
    connectSubmitFlow(this._chatCreationFlow, this.chatCreated);
  }

  protected onSubmit(): void {
    this._chatListStore.createChat(this._createChatValue(), this._chatCreationFlow);
  }
}

import { Component, inject, output, signal } from '@angular/core';
import { required } from '@angular/forms/signals';

import { ChatListStore } from '@domains/chats/data/chat-list-store';
import { createSubmitFlowForm } from '@shared/forms';
import { createFormSubmitFlowState } from '@shared/submit-flow';
import { Form } from '@shared/ui/form/form';
import { TextFieldConfig } from '@shared/ui/text-field/text-field-config.type';

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

  readonly createChatForm = createSubmitFlowForm({
    value: this._createChatValue,
    schema: (path) => {
      required(path.title);
    },
    flow: this._chatCreationFlow,
    succeeded: this.chatCreated,
  });

  protected readonly isSubmitting = this._chatCreationFlow.isSubmitting;

  protected readonly fields: TextFieldConfig[] = [
    { label: 'Title', type: 'text', field: this.createChatForm.title },
  ];

  protected onSubmit(): void {
    this._chatListStore.createChat(this._createChatValue(), this._chatCreationFlow);
  }
}

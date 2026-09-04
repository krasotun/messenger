import { Component, effect, inject, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { CreateChatStatus } from '../../application/create-chat/create-chat-status';
import { CreateChatService } from '../../application/create-chat/create-chat.service';

import { Button } from '@shared/ui/button/button';
import { FormField } from '@shared/ui/form-field/form-field';
import { Input } from '@shared/ui/input/input';

interface CreateChatFormModel {
  title: FormControl<string>;
}

@Component({
  selector: 'app-create-chat-form',
  imports: [Input, FormField, Button, ReactiveFormsModule],
  templateUrl: './create-chat-form.html',
  styleUrl: './create-chat-form.scss',
})
export class CreateChatForm {
  readonly createChatForm = new FormGroup<CreateChatFormModel>({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  readonly chatCreated = output<void>();

  private readonly _createChatService = inject(CreateChatService);

  protected readonly isSubmitting = this._createChatService.isSubmitting;
  protected readonly errorMessage = this._createChatService.errorMessage;

  constructor() {
    effect(() => {
      if (this.isSubmitting()) {
        this.createChatForm.disable({ emitEvent: false });
      } else {
        this.createChatForm.enable({ emitEvent: false });
      }
    });

    effect(() => {
      if (this._createChatService.status() === CreateChatStatus.Success) {
        this._createChatService.reset();

        this.chatCreated.emit();
      }
    });
  }

  protected onSubmit(): void {
    if (this.createChatForm.invalid) {
      this.createChatForm.markAllAsTouched();
      return;
    }

    const { title } = this.createChatForm.getRawValue();

    this._createChatService.createChat({ title });
  }

  protected getControlError(): string | undefined {
    if (!this.hasControlError()) {
      return undefined;
    }

    return 'Обязательное поле';
  }

  protected hasControlError(): boolean {
    const { errors, touched } = this.createChatForm.controls.title;

    return touched && !!errors;
  }
}

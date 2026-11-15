import { Component, inject } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { CreateChatForm } from '../create-chat-form/create-chat-form';

import { ChatListStore } from '@domains/chats/data/chat-list-store';

export interface CreateChatDialogData {
  chatListStore: ChatListStore;
}

@Component({
  selector: 'app-create-chat-modal-content',
  imports: [CreateChatForm],
  templateUrl: './create-chat-modal-content.html',
  // Диалог кита растет от корневого инжектора, а Стор живет со страницей:
  // отдаем форме тот Стор, который открывший передал в data.
  providers: [
    {
      provide: ChatListStore,
      useFactory: () =>
        inject<DynamicDialogConfig<CreateChatDialogData>>(DynamicDialogConfig).data!.chatListStore,
    },
  ],
})
export class CreateChatModalContent {
  private readonly _dialogRef = inject(DynamicDialogRef);

  protected closeModal(): void {
    this._dialogRef.close();
  }
}

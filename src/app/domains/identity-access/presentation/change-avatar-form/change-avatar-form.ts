import { Component, computed, DestroyRef, effect, inject, signal, untracked } from '@angular/core';

import { AuthFlowStatus } from '../../application/auth-flow-status.type';
import { ChangeAvatarService } from '../../application/change-avatar/change-avatar.service';
import { CurrentSessionService } from '../../application/current-session/current-session.service';

import { Nullable } from '@shared/types';
import { Avatar } from '@shared/ui/avatar/avatar';
import { Button } from '@shared/ui/button/button';

const acceptedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const formatErrorMessage = 'Допустимые форматы: JPEG, JPG, PNG, GIF, WebP';
const missingFileErrorMessage = 'Выберите файл';

@Component({
  selector: 'app-change-avatar-form',
  imports: [Avatar, Button],
  templateUrl: './change-avatar-form.html',
  styleUrl: './change-avatar-form.scss',
})
export class ChangeAvatarForm {
  readonly acceptedMimeTypes = acceptedMimeTypes.join(',');

  private readonly _changeAvatarService = inject(ChangeAvatarService);
  private readonly _currentSessionService = inject(CurrentSessionService);

  private readonly _selectedFile = signal<Nullable<File>>(null);
  private readonly _previewUrl = signal<Nullable<string>>(null);
  private readonly _validationErrorMessage = signal<Nullable<string>>(null);

  protected readonly isSubmitting = this._changeAvatarService.isSubmitting;

  protected readonly previewUrl = this._previewUrl.asReadonly();

  protected readonly selectedFileName = computed<string>(() => {
    return this._selectedFile()?.name ?? 'Файл не выбран';
  });

  protected readonly avatarUrl = computed<Nullable<string>>(() => {
    return this._previewUrl() ?? this._currentSessionService.currentUser()?.avatar ?? null;
  });

  protected readonly errorMessage = computed<Nullable<string>>(() => {
    return this._validationErrorMessage() ?? this._changeAvatarService.errorMessage();
  });

  constructor() {
    effect(() => {
      if (this._changeAvatarService.status() === AuthFlowStatus.Success) {
        untracked(() => {
          this._changeAvatarService.reset();

          this._selectFile(null);
        });
      }
    });

    inject(DestroyRef).onDestroy(() => {
      this._revokePreviewUrl();
    });
  }

  protected onFileSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0] ?? null;

    if (file && !acceptedMimeTypes.includes(file.type)) {
      this._selectFile(null);
      this._validationErrorMessage.set(formatErrorMessage);

      return;
    }

    this._selectFile(file);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();

    const file = this._selectedFile();

    if (!file) {
      this._validationErrorMessage.set(this._validationErrorMessage() ?? missingFileErrorMessage);

      return;
    }

    this._changeAvatarService.changeAvatar({ file });
  }

  private _selectFile(file: Nullable<File>): void {
    this._revokePreviewUrl();

    this._selectedFile.set(file);
    this._previewUrl.set(file ? URL.createObjectURL(file) : null);
    this._validationErrorMessage.set(null);
  }

  private _revokePreviewUrl(): void {
    const previewUrl = this._previewUrl();

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  }
}

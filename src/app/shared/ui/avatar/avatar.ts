import { Component, computed, input, linkedSignal } from '@angular/core';

import { Nullable } from '@shared/types';

type AvatarSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-avatar',
  imports: [],
  templateUrl: './avatar.html',
  styleUrl: './avatar.scss',
})
export class Avatar {
  readonly label = input.required<string>();
  readonly imageUrl = input<Nullable<string>>(null);
  readonly size = input<AvatarSize>('md');
  readonly fallbackText = input<string>('');

  // Сбой загрузки относится к конкретному адресу: при смене imageUrl попытка
  // показать изображение начинается заново, иначе аватар навсегда остается
  // заглушкой после одной неудачной картинки.
  readonly imageFailed = linkedSignal<Nullable<string>, boolean>({
    source: this.imageUrl,
    computation: () => false,
  });

  readonly sizeClass = computed(() => `avatar_${this.size()}`);
  readonly imageShown = computed(() => !!this.imageUrl() && !this.imageFailed());

  protected onImageError() {
    this.imageFailed.set(true);
  }
}

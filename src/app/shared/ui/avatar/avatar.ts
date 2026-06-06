import { Component, computed, input, signal } from '@angular/core';

import { Nullable } from '@app/shared/types';

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

  readonly imageFailed = signal(false);

  readonly sizeClass = computed(() => `avatar_${this.size()}`);
  readonly imageShown = computed(() => !!this.imageUrl() && !this.imageFailed());

  protected onImageError() {
    this.imageFailed.set(true);
  }
}

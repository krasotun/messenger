// PROTOTYPE: одноразовый переключатель вариантов UI, в main не попадает.
import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';

export interface PrototypeVariant {
  key: string;
  name: string;
}

@Component({
  selector: 'app-prototype-switcher',
  template: `
    @if (isDev) {
      <div class="prototype-switcher">
        <button type="button" (click)="step(-1)" aria-label="Previous variant">‹</button>
        <span>{{ label() }}</span>
        <button type="button" (click)="step(1)" aria-label="Next variant">›</button>
      </div>
    }
  `,
  styles: `
    .prototype-switcher {
      position: fixed;
      bottom: 16px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 6px 10px;
      border-radius: 999px;
      background: #111;
      color: #fff;
      font:
        600 13px/1 system-ui,
        sans-serif;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
    }

    button {
      width: 28px;
      height: 28px;
      border: 0;
      border-radius: 50%;
      background: #333;
      color: #fff;
      font-size: 18px;
      cursor: pointer;
    }
  `,
  host: {
    '(document:keydown)': 'onKeydown($event)',
  },
})
export class PrototypeSwitcher {
  readonly variants = input.required<PrototypeVariant[]>();
  readonly current = input.required<string>();

  private readonly _router = inject(Router);

  // Ветка одноразовая и в main не мержится, поэтому бар виден в любой сборке.
  protected readonly isDev = true;

  protected readonly label = computed(() => {
    const variant = this.variants().find(({ key }) => key === this.current());

    return variant ? `${variant.key} · ${variant.name}` : this.current();
  });

  protected step(delta: number): void {
    const variants = this.variants();
    const index = variants.findIndex(({ key }) => key === this.current());
    const next = variants[(index + delta + variants.length) % variants.length];

    this._router.navigate([], {
      queryParams: { variant: next.key },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  protected onKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;

    if (target?.closest('input, textarea, [contenteditable]')) {
      return;
    }

    if (event.key === 'ArrowLeft') {
      this.step(-1);
    } else if (event.key === 'ArrowRight') {
      this.step(1);
    }
  }
}

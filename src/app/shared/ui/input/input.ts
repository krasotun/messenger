import { computed, DestroyRef, Directive, inject, OnInit, signal, Signal } from '@angular/core';
import { NgControl } from '@angular/forms';

import { ControlState, createControlState } from '@shared/forms';

@Directive({
  selector: 'input[appInput]',
  host: {
    '[attr.aria-invalid]': 'invalid()',
  },
})
export class Input implements OnInit {
  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly destroyRef = inject(DestroyRef);

  private readonly controlState = signal<Signal<ControlState> | null>(null);
  private readonly state = computed(() => this.controlState()?.() ?? null);

  readonly invalid = computed(() => this.state()?.showMessage ?? false);

  ngOnInit(): void {
    const control = this.ngControl?.control;

    if (control) {
      this.controlState.set(createControlState(control, this.destroyRef));
    }
  }
}

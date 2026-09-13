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
  private readonly _ngControl = inject(NgControl, { optional: true, self: true });
  private readonly _destroyRef = inject(DestroyRef);

  private readonly _stateSource = signal<Signal<ControlState> | null>(null);
  private readonly _controlState = computed(() => this._stateSource()?.() ?? null);

  readonly invalid = computed(() => this._controlState()?.showMessage ?? false);

  ngOnInit(): void {
    const control = this._ngControl?.control;

    if (control) {
      this._stateSource.set(createControlState(control, this._destroyRef));
    }
  }
}

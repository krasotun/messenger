import {
  computed,
  Directive,
  inject,
  Injector,
  OnInit,
  runInInjectionContext,
  signal,
  Signal,
} from '@angular/core';
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
  private readonly injector = inject(Injector);
  private readonly controlState = signal<Signal<ControlState> | null>(null);

  readonly invalid = computed(() => {
    const state = this.controlState();

    return state !== null && state().touched && !!state().errors;
  });

  ngOnInit(): void {
    const control = this.ngControl?.control;

    if (control) {
      this.controlState.set(
        runInInjectionContext(this.injector, () => createControlState(control)),
      );
    }
  }
}

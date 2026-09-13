import {
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  signal,
  Signal,
} from '@angular/core';
import { AbstractControl } from '@angular/forms';

import { ControlState, createControlState, resolveControlError } from '@shared/forms';

@Component({
  selector: 'app-form-field',
  imports: [],
  templateUrl: './form-field.html',
  styleUrl: './form-field.scss',
})
export class FormField implements OnInit {
  readonly label = input.required<string>();
  readonly control = input.required<AbstractControl>();

  private readonly _destroyRef = inject(DestroyRef);

  private readonly _stateSource = signal<Signal<ControlState> | null>(null);
  private readonly _controlState = computed(() => this._stateSource()?.() ?? null);

  protected readonly message = computed(() => {
    const state = this._controlState();

    return state?.showMessage ? resolveControlError(state.errors) : undefined;
  });

  ngOnInit(): void {
    this._stateSource.set(createControlState(this.control(), this._destroyRef));
  }
}

import {
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
  signal,
  Signal,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { createSubmitAvailability } from '@shared/forms';
import { Button } from '@shared/ui/button/button';

@Component({
  selector: 'app-form',
  imports: [ReactiveFormsModule, Button],
  templateUrl: './form.html',
  styleUrl: './form.scss',
})
export class Form implements OnInit {
  readonly group = input.required<FormGroup>();
  readonly submitLabel = input.required<string>();
  readonly requireChanges = input(false);
  readonly isSubmitting = input(false);

  readonly submitted = output<void>();

  private readonly _destroyRef = inject(DestroyRef);

  private readonly _canSubmitSource = signal<Signal<boolean> | null>(null);
  private readonly _canSubmit = computed(() => this._canSubmitSource()?.() ?? false);

  protected readonly disabled = computed(() => this.isSubmitting() || !this._canSubmit());

  ngOnInit(): void {
    this._canSubmitSource.set(
      createSubmitAvailability(this.group(), this._destroyRef, {
        requireChanges: this.requireChanges(),
      }),
    );
  }

  protected onSubmit(): void {
    if (this.group().invalid) {
      return;
    }

    this.submitted.emit();
  }
}

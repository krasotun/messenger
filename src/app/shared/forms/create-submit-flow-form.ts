import { OutputEmitterRef, Signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  apply,
  disabled,
  FieldTree,
  form,
  SchemaOrSchemaFn,
  SchemaPath,
} from '@angular/forms/signals';
import { Observable } from 'rxjs';

export interface SubmitFlow {
  isSubmitting: Signal<boolean>;
  succeeded$: Observable<void>;
}

export interface SubmitFlowFormOptions<TValue> {
  value: WritableSignal<TValue>;
  schema: SchemaOrSchemaFn<TValue>;
  flow: SubmitFlow;
  succeeded: OutputEmitterRef<void>;
}

// Форма и ее Флоу отправки связываются одним вызовом: блокировку полей на
// время отправки нельзя забыть, заведя форму в обход.
export const createSubmitFlowForm = <TValue>({
  value,
  schema,
  flow,
  succeeded,
}: SubmitFlowFormOptions<TValue>): FieldTree<TValue> => {
  flow.succeeded$.pipe(takeUntilDestroyed()).subscribe(() => {
    succeeded.emit();
  });

  return form(value, (path) => {
    // Для обобщенного `TValue` компилятор не сводит дерево путей к корневому
    // пути; корень схемы им всегда является.
    const rootPath = path as SchemaPath<TValue>;

    apply(rootPath, schema);
    // Правило схемы, а не эффект: недоступность поля в signal forms выводится
    // из состояния, императивных enable/disable у формы нет.
    disabled(rootPath, () => flow.isSubmitting());
  });
};

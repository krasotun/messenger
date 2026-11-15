import { DynamicDialogConfig } from 'primeng/dynamicdialog';

// Общие опции открытия диалога: все способы закрыть окно включены. Фича
// по-прежнему зовет DialogService кита сама и разворачивает константу в опции.
// `duplicate` не включаем: повторный open того же содержимого возвращает null.
export const DIALOG_DEFAULTS: DynamicDialogConfig = {
  modal: true,
  closable: true,
  closeOnEscape: true,
  dismissableMask: true,
};

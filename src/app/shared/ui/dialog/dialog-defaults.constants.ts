import { DynamicDialogConfig } from 'primeng/dynamicdialog';

// Общие опции открытия диалога: все способы закрыть окно включены. Фича
// по-прежнему зовет DialogService кита сама и разворачивает константу в опции.
// `duplicate` не включаем: повторный open того же содержимого возвращает null.
export const DIALOG_DEFAULTS: DynamicDialogConfig = {
  modal: true,
  closable: true,
  closeOnEscape: true,
  dismissableMask: true,
  // Без ширины кит сжимает окно по содержимому. 480px контента - ширина форм
  // Входа и Регистрации, как было у прежней модалки; отступы добавляет тема.
  width: 'calc(480px + 2 * var(--p-overlay-modal-padding))',
  // На узком экране окно не шире 90% вьюпорта.
  breakpoints: { '575px': '90vw' },
};

export interface Notifier {
  success(title: string, text: string, delayMs?: number): void;
  error(title: string, text: string, delayMs?: number): void;
}

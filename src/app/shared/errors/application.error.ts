export class ApplicationError extends Error {
  override readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'ApplicationError';
    this.cause = cause;
  }
}

export interface DomainLogger {
  info(message: string, context?: Record<string, any>): void;
  error(message: string, context?: Record<string, any>): void;
}

export class NoopDomainLogger implements DomainLogger {
  info(): void {}
  error(): void {}
}

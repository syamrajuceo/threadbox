import { Logger } from '@nestjs/common';

export class AppLogger extends Logger {
  log(message: string, context?: string) {
    super.log(message, context);
    // Add external logging service integration here (e.g., Winston, Pino)
  }

  error(message: string, trace?: string, context?: string) {
    super.error(message, trace, context);
    // Add error tracking service integration here (e.g., Sentry)
  }

  warn(message: string, context?: string) {
    super.warn(message, context);
  }

  debug(message: string, context?: string) {
    super.debug(message, context);
  }
}

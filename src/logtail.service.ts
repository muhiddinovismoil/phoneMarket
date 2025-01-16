import { Injectable, LoggerService } from '@nestjs/common';
import { Logtail } from '@logtail/node';

@Injectable()
export class LogtailService implements LoggerService {
  private logtail: Logtail;

  constructor() {
    this.logtail = new Logtail(process.env.LOGTAIL_TOKEN);
  }

  log(message: any, context?: string): void {
    this.logtail.info(message, { context });
  }

  error(message: any, trace?: string, context?: string): void {
    this.logtail.error(message, { trace, context });
  }

  warn(message: any, context?: string): void {
    this.logtail.warn(message, { context });
  }

  debug?(message: any, context?: string): void {
    this.logtail.debug(message, { context });
  }

  verbose?(message: any, context?: string): void {
    this.logtail.info(message, { context });
  }
}

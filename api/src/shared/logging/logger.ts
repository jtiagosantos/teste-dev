import { Injectable } from '@nestjs/common';
import { Logger as PinoLogger } from 'nestjs-pino';

export enum LogStatus {
  STARTED = 'STARTED',
  FINISHED = 'FINISHED',
  FAILED = 'FAILED',
}

export type MessageData = {
  message: string;
  origin: string;
  action: string;
  status: LogStatus;
  payload: Record<string, any>;
};

@Injectable()
export class Logger {
  constructor(private readonly logger: PinoLogger) {}

  log(message: MessageData, ...args: any[]) {
    this.logger.log(message, ...args);
  }

  error(message: MessageData, ...args: any[]) {
    this.logger.error(message, ...args);
  }

  debug(message: MessageData, ...args: any[]) {
    this.logger.debug(message, ...args);
  }

  warn(message: MessageData, ...args: any[]) {
    this.logger.warn(message, ...args);
  }

  verbose(message: MessageData, ...args: any[]) {
    this.logger.verbose(message, ...args);
  }

  fatal(message: MessageData, ...args: any[]) {
    this.logger.fatal(message, ...args);
  }
}

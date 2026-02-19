import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { Logger } from './logger';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        useLevel: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  translateTime: 'HH:MM:ss Z',
                  ignore: 'pid,hostname',
                },
              }
            : undefined,
        customProps: () => ({}),
        serializers: {
          req: () => undefined,
          res: () => undefined,
        },
        redact: {
          paths: ['req.headers.authorization', 'req.headers.cookie'],
          censor: '[REDACTED]',
        },
      },
    }),
  ],
  providers: [Logger],
  exports: [Logger],
})
export class LoggingModule {}

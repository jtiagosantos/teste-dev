import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from './shared/logging/logger';
import { setLoggerInstance } from './shared/logging/decorators/log-execution.decorator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const logger = app.get(Logger);
  setLoggerInstance(logger);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

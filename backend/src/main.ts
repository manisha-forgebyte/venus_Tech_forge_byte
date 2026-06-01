import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AppValidationPipe } from './common/pipes/validation.pipe';

async function bootstrap() {
  // Create NestJS application
  const app = await NestFactory.create(AppModule);

  // Enable global DTO validation
  app.useGlobalPipes(new AppValidationPipe());
  app.useGlobalInterceptors(new LoggingInterceptor(), new ResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());

  // Enable CORS for the Angular dev server.
  app.enableCors({
    origin: ['http://localhost:4200'],
    credentials: true,
  });

  // Start backend server
  const port = Number(process.env.PORT || 3000);
  await app.listen(port);

  console.log(`Backend running on http://localhost:${port}`);
}

bootstrap();

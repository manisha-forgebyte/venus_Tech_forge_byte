import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AppValidationPipe } from './common/pipes/validation.pipe';
import { DEFAULT_FRONTEND_ORIGIN, DEFAULT_PORT } from './constants/app.constants';

async function bootstrap() {
  // Create NestJS application
  const app = await NestFactory.create(AppModule);

  // Enable global DTO validation
  app.useGlobalPipes(new AppValidationPipe());
  app.useGlobalInterceptors(new LoggingInterceptor(), new ResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());

  // Enable CORS for the Angular dev server.
  // Enable CORS for the frontend. Allow explicit origins from FRONTEND_URL
  // or fall back to localhost dev and the known Railway frontend host.
  const frontendEnv = process.env.FRONTEND_URL || '';
  const fallbackOrigins = [DEFAULT_FRONTEND_ORIGIN, 'https://caring-reverence-production-e548.up.railway.app'];

  const allowedOrigins = frontendEnv
    ? frontendEnv
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
    : fallbackOrigins;

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. server-to-server, mobile clients)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.warn(`Blocked CORS origin: ${origin}`);
      return callback(new Error('Origin not allowed by CORS'));
    },
    credentials: true,
  });

  console.log(`Allowed CORS origins: ${allowedOrigins.join(', ')}`);

  // Start backend server
  const port = Number(process.env.PORT || DEFAULT_PORT);
  await app.listen(port);

  console.log(`Backend running on http://localhost:${port}`);
}

bootstrap();

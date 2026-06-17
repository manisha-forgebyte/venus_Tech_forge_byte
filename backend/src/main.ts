import { NestFactory } from '@nestjs/core';
import { execSync } from 'child_process';

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
  // Before starting, verify that the Prisma tables exist; if not, attempt runtime seeding.
  try {
    // Use a lightweight Prisma client to probe the User table existence.
    // Importing at runtime to avoid adding direct compile-time dependency issues.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    try {
      // Try a simple query to see if `User` table exists
      await prisma.user.findFirst({ take: 1 });
    } catch (innerErr) {
      const message = String(innerErr?.message || innerErr);
      if (message.includes("does not exist") || message.includes('relation \"User\" does not exist')) {
        console.warn('Prisma User table missing — attempting runtime seed via scripts/prisma-seed-runtime.js');
        try {
          execSync('node ./scripts/prisma-seed-runtime.js', { stdio: 'inherit', cwd: process.cwd(), env: process.env });
          console.log('Runtime seed executed');
        } catch (seedErr) {
          console.error('Runtime seed failed:', seedErr);
        }
      }
    } finally {
      await prisma.$disconnect();
    }
  } catch (probeErr) {
    console.warn('Prisma probe skipped or failed:', probeErr?.message || probeErr);
  }

  const port = Number(process.env.PORT || DEFAULT_PORT);
  await app.listen(port);

  console.log(`Backend running on http://localhost:${port}`);
}

bootstrap();

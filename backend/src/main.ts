import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';

import {
  ValidationPipe,
  BadRequestException,
  ClassSerializerInterceptor,
} from '@nestjs/common';

import helmet from 'helmet';

import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // =========================================================
  // SEGURIDAD HEADERS
  // =========================================================

  app.use(helmet());

  // =========================================================
  // CORS
  // =========================================================

  app.enableCors({
    origin: [
      'http://localhost:3000',
    ],
    credentials: true,
  });

  // =========================================================
  // VALIDACIÓN GLOBAL
  // =========================================================

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,

      forbidNonWhitelisted: true,

      transform: true,

      exceptionFactory: (errors) => {
        const mensajes = errors
          .map((err) =>
            Object.values(err.constraints || {}),
          )
          .flat();

        return new BadRequestException(
          mensajes,
        );
      },
    }),
  );

  // =========================================================
  // SERIALIZER
  // =========================================================

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(
      app.get(Reflector),
    ),
  );

  // =========================================================
  // START SERVER
  // =========================================================

  const port =
    process.env.PORT || 3001;

  app.use(
  '/uploads',
  express.static(
    join(
      process.cwd(),
      'uploads',
    ),
  ),
);
  await app.listen(port);

  console.log(
    `🚀 Server corriendo en http://localhost:${port}`,
  );
}

bootstrap();
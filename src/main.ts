import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS để frontend có thể gọi API
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'], // Cho phép Next.js gọi API
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true, // Tự động transform query params
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `🚀 Server is running on: http://localhost:${process.env.PORT ?? 3000}`,
  );
}
bootstrap();

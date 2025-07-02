import * as dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
  origin: [
    'http://localhost:3000',
    'https://hrms-frontend-git-main-vrajs-projects-c97b9bd7.vercel.app',
    'https://hrms-frontend-beryl.vercel.app',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});

  app.useGlobalPipes(new ValidationPipe());

  console.log('=== HRMS BACKEND STARTED ===');
  await app.listen(process.env.PORT ?? 5000);
  console.log('Server running on Port 5000');
}
void bootstrap();

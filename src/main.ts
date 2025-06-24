import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://hrms-frontend-git-vraj24062025-vrajs-projects-c97b9bd7.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  console.log('CORS ORIGINS:', [
    'http://localhost:3000',
    'https://hrms-frontend-git-vraj24062025-vrajs-projects-c97b9bd7.vercel.app'
  ]);

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT ?? 5000);
  console.log("Server running on Port 5000");
}
bootstrap();

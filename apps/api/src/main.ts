import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  const config = app.get(ConfigService);

  // Debug logging middleware
  app.use((req, res, next) => {
    console.log(`[Middleware] ${req.method} ${req.path} - Starting`);
    next();
  });

  // Security headers
  app.use(helmet());

  // CORS
  app.enableCors({
    origin: [
      config.get('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
      'http://localhost:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Version'],
  });

  // API versioning
  app.enableVersioning({ type: VersioningType.URI });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api');

  // OpenAPI / Swagger
  if (config.get('NODE_ENV') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('PhishForge AI API')
      .setDescription('AI-powered phishing simulation platform API')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication endpoints')
      .addTag('campaigns', 'Campaign management')
      .addTag('templates', 'Email template management')
      .addTag('ai', 'AI generation and model management')
      .addTag('knowledge', 'Knowledge base management')
      .addTag('analytics', 'Analytics and reporting')
      .addTag('billing', 'Subscription and billing')
      .addTag('webhooks', 'Webhook management')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = config.get<number>('PORT', 4000);
  await app.listen(port);

  console.log(`PhishForge API running on http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();

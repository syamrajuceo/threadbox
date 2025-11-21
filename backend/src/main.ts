import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    // Create app without waiting for database connection
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
      bufferLogs: true,
    });

    // Enable CORS
    app.enableCors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    // Enable validation
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    const port = process.env.PORT || 3001;

    // Start listening first, then verify DB connection
    await app.listen(port, '0.0.0.0');
    console.log(`Application is running on: http://0.0.0.0:${port}`);

    // Log database connection status (non-blocking)
    setTimeout(() => {
      void (async () => {
        try {
          const { DataSource } = await import('typeorm');
          const dataSource = app.get<DataSource>(DataSource);
          if (dataSource?.isInitialized) {
            console.log('✅ Database connection established');
          } else {
            console.warn('⚠️ Database connection pending...');
          }
        } catch (err) {
          console.warn('⚠️ Database connection check failed:', err);
        }
      })();
    }, 2000);
  } catch (error) {
    console.error('Error starting application:', error);
    process.exit(1);
  }
}
bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});

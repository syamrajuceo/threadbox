import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const isDevelopment = configService.get<string>('NODE_ENV') === 'development';
  const databaseHost = configService.get<string>('DATABASE_HOST', 'localhost');
  const isCloudSqlSocket = databaseHost.startsWith('/cloudsql/');

  // For Cloud SQL Unix sockets, use connection string format
  if (isCloudSqlSocket) {
    const username = configService.get<string>('DATABASE_USER', 'threadbox');
    const password = configService.get<string>('DATABASE_PASSWORD', 'password');
    const database = configService.get<string>('DATABASE_NAME', 'threadbox');
    
    return {
      type: 'postgres',
      url: `postgresql://${username}:${password}@/${database}?host=${encodeURIComponent(databaseHost)}`,
      entities: [join(__dirname, '..', '**', '*.entity.js')],
      synchronize: isDevelopment,
      logging: isDevelopment ? ['error', 'warn', 'schema'] : false,
      migrations: [join(__dirname, '..', 'database', 'migrations', '*.js')],
      migrationsRun: false,
      extra: {
        max: 10,
        connectionTimeoutMillis: 60000, // 60 seconds for Cloud SQL
        idleTimeoutMillis: 30000,
        // Don't fail on connection errors during startup
        statement_timeout: 30000,
      },
      retryAttempts: 10, // Increased retry attempts
      retryDelay: 5000, // 5 seconds between retries
      autoLoadEntities: false,
      // Don't fail app startup if DB connection fails
      // The connection will be retried automatically
    };
  }

  // Standard TCP connection
  return {
    type: 'postgres',
    host: databaseHost,
    port: configService.get<number>('DATABASE_PORT', 5432),
    username: configService.get<string>('DATABASE_USER', 'threadbox'),
    password: configService.get<string>('DATABASE_PASSWORD', 'password'),
    database: configService.get<string>('DATABASE_NAME', 'threadbox'),
    entities: [join(__dirname, '..', '**', '*.entity.js')],
    synchronize: isDevelopment,
    logging: isDevelopment ? ['error', 'warn', 'schema'] : false,
    migrations: [join(__dirname, '..', 'database', 'migrations', '*.js')],
    migrationsRun: false,
    extra: {
      max: 10,
      connectionTimeoutMillis: 20000,
      idleTimeoutMillis: 30000,
    },
    retryAttempts: 5,
    retryDelay: 3000,
    autoLoadEntities: false,
  };
};

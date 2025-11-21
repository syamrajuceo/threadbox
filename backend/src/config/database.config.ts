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
    const password = encodeURIComponent(configService.get<string>('DATABASE_PASSWORD', 'password'));
    const database = configService.get<string>('DATABASE_NAME', 'threadbox');
    
    // Correct format for Cloud SQL Unix socket: postgresql://user:pass@/dbname?host=/cloudsql/...
    const connectionUrl = `postgresql://${username}:${password}@/${database}?host=${encodeURIComponent(databaseHost)}`;
    
    return {
      type: 'postgres',
      url: connectionUrl,
      entities: [join(__dirname, '..', '**', '*.entity.js')],
      synchronize: isDevelopment,
      logging: isDevelopment ? ['error', 'warn', 'schema'] : false,
      migrations: [join(__dirname, '..', 'database', 'migrations', '*.js')],
      migrationsRun: false,
      extra: {
        max: 10,
        connectionTimeoutMillis: 90000, // 90 seconds for Cloud SQL
        idleTimeoutMillis: 30000,
        statement_timeout: 30000,
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000,
      },
      retryAttempts: 10, // Increased retry attempts
      retryDelay: 5000, // 5 seconds between retries
      autoLoadEntities: false,
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

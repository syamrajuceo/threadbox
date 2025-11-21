import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const isDevelopment = configService.get<string>('NODE_ENV') === 'development';
  const databaseHost = configService.get<string>('DATABASE_HOST', 'localhost');
  const isCloudSqlSocket = databaseHost.startsWith('/cloudsql/');

  return {
    type: 'postgres',
    host: databaseHost,
    // For Cloud SQL Unix sockets, port should be undefined
    port: isCloudSqlSocket ? undefined : configService.get<number>('DATABASE_PORT', 5432),
    username: configService.get<string>('DATABASE_USER', 'threadbox'),
    password: configService.get<string>('DATABASE_PASSWORD', 'password'),
    database: configService.get<string>('DATABASE_NAME', 'threadbox'),
    entities: [join(__dirname, '..', '**', '*.entity.js')],
    synchronize: isDevelopment,
    logging: isDevelopment ? ['error', 'warn', 'schema'] : false,
    migrations: [join(__dirname, '..', 'database', 'migrations', '*.js')],
    migrationsRun: false,
    // Connection pool settings
    extra: {
      max: 10, // Maximum number of connections in the pool
      connectionTimeoutMillis: 60000, // 60 seconds (increased for Cloud SQL)
      idleTimeoutMillis: 30000, // 30 seconds
    },
    // Retry connection on failure
    retryAttempts: 5,
    retryDelay: 3000, // 3 seconds
    // Auto reconnect
    autoLoadEntities: false, // We're specifying entities manually
  };
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseConfig = void 0;
const path_1 = require("path");
const getDatabaseConfig = (configService) => {
    const isDevelopment = configService.get('NODE_ENV') === 'development';
    const databaseHost = configService.get('DATABASE_HOST', 'localhost');
    const isCloudSqlSocket = databaseHost.startsWith('/cloudsql/');
    if (isCloudSqlSocket) {
        const username = configService.get('DATABASE_USER', 'threadbox');
        const password = encodeURIComponent(configService.get('DATABASE_PASSWORD', 'password'));
        const database = configService.get('DATABASE_NAME', 'threadbox');
        const connectionUrl = `postgresql://${username}:${password}@/${database}?host=${encodeURIComponent(databaseHost)}`;
        return {
            type: 'postgres',
            url: connectionUrl,
            entities: [(0, path_1.join)(__dirname, '..', '**', '*.entity.js')],
            synchronize: isDevelopment,
            logging: isDevelopment ? ['error', 'warn', 'schema'] : false,
            migrations: [(0, path_1.join)(__dirname, '..', 'database', 'migrations', '*.js')],
            migrationsRun: false,
            extra: {
                max: 10,
                connectionTimeoutMillis: 90000,
                idleTimeoutMillis: 30000,
                statement_timeout: 30000,
                keepAlive: true,
                keepAliveInitialDelayMillis: 10000,
            },
            retryAttempts: 10,
            retryDelay: 5000,
            autoLoadEntities: false,
        };
    }
    return {
        type: 'postgres',
        host: databaseHost,
        port: configService.get('DATABASE_PORT', 5432),
        username: configService.get('DATABASE_USER', 'threadbox'),
        password: configService.get('DATABASE_PASSWORD', 'password'),
        database: configService.get('DATABASE_NAME', 'threadbox'),
        entities: [(0, path_1.join)(__dirname, '..', '**', '*.entity.js')],
        synchronize: isDevelopment,
        logging: isDevelopment ? ['error', 'warn', 'schema'] : false,
        migrations: [(0, path_1.join)(__dirname, '..', 'database', 'migrations', '*.js')],
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
exports.getDatabaseConfig = getDatabaseConfig;
//# sourceMappingURL=database.config.js.map
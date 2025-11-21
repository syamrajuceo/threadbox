"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function bootstrap() {
    try {
        const app = await core_1.NestFactory.create(app_module_1.AppModule, {
            logger: ['error', 'warn', 'log', 'debug', 'verbose'],
            bufferLogs: true,
        });
        app.enableCors({
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        });
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }));
        const port = process.env.PORT || 3001;
        await app.listen(port, '0.0.0.0');
        console.log(`Application is running on: http://0.0.0.0:${port}`);
        setTimeout(() => {
            void (async () => {
                try {
                    const { DataSource } = await import('typeorm');
                    const dataSource = app.get(DataSource);
                    if (dataSource?.isInitialized) {
                        console.log('✅ Database connection established');
                    }
                    else {
                        console.warn('⚠️ Database connection pending...');
                    }
                }
                catch (err) {
                    console.warn('⚠️ Database connection check failed:', err);
                }
            })();
        }, 2000);
    }
    catch (error) {
        console.error('Error starting application:', error);
        process.exit(1);
    }
}
bootstrap().catch((error) => {
    console.error('Failed to start application:', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map
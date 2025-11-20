"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJwtConfig = void 0;
const getJwtConfig = (configService) => {
    const expiresIn = configService.get('JWT_EXPIRES_IN', '24h');
    return {
        secret: configService.get('JWT_SECRET', 'your-secret-key'),
        signOptions: {
            expiresIn: expiresIn,
        },
    };
};
exports.getJwtConfig = getJwtConfig;
//# sourceMappingURL=jwt.config.js.map
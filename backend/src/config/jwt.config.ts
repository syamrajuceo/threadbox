import { JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export const getJwtConfig = (
  configService: ConfigService,
): JwtModuleOptions => {
  const expiresIn = configService.get<string>('JWT_EXPIRES_IN', '24h');
  return {
    secret: configService.get<string>('JWT_SECRET', 'your-secret-key'),
    signOptions: {
      expiresIn: expiresIn as string | number, // JWT accepts string or number for expiresIn
    },
  };
};

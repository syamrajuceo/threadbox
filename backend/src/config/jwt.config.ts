import { JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export const getJwtConfig = (
  configService: ConfigService,
): JwtModuleOptions => {
  const expiresIn = configService.get<string>('JWT_EXPIRES_IN', '24h');
  return {
    secret: configService.get<string>('JWT_SECRET', 'your-secret-key'),
    signOptions: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expiresIn: expiresIn as any, // JWT accepts string or number for expiresIn, but type system expects StringValue
    },
  };
};

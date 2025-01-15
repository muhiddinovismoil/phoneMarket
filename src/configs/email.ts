import { ConfigService } from '@nestjs/config';

export const EmailConfig = (configService: ConfigService) => ({
  email: configService.get('USER_EMAIL'),
  pass: configService.get('APP_PASSWORD'),
});

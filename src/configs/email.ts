import { ConfigService } from '@nestjs/config';

export const EmailConfig = (configService: ConfigService) => ({
  email: configService.get('USER_MAIL'),
  pass: configService.get('USER_MAIL_PASSWORD'),
});

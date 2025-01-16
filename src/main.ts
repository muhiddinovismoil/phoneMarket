import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';
import { WinstonModule } from 'nest-winston';
import { Logtail } from '@logtail/node';
import { LogtailTransport } from '@logtail/winston';

const logtail = new Logtail(process.env.LOGTAIL_TOKEN);
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [new LogtailTransport(logtail)],
    }),
  });
  app.useGlobalPipes(new ValidationPipe());
  app.use(
    ['/api/docs'],
    basicAuth({
      users: { owner: '1111' },
      challenge: true,
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('PHONE MARKET')
    .setDescription('Phone Market app backend')
    .addBearerAuth()
    .setVersion('1.0')
    .addTag('PhoneMarket')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, documentFactory);
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Server is running on PORT: ${process.env.PORT}`);
}
bootstrap();

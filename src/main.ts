import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
    .setVersion('1.0')
    .addTag('PhoneMarket')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, documentFactory);
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Server is running on PORT: ${process.env.PORT}`);
}
bootstrap();

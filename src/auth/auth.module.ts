import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OTP } from './entities/otp.entity';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../constants/jwt.constant';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: jwtConstants.access.secret,
      signOptions: { expiresIn: jwtConstants.access.expiresIn },
    }),
    ,
    UsersModule,
    TypeOrmModule.forFeature([OTP]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OTP } from './entities/otp.entity';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([OTP])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}

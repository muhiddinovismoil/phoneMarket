import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignInAuthDto } from './dto/signin-auth.dto';
import { UsersService } from '../users/users.service';
import { SignUpAuthDto } from '../users/dto/create-user.dto';
import { generateOtp } from '../helpers/otp';
import { sendEmail } from '../helpers/sendMail';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { ResetPasswordAuthDto } from './dto/reset-password.dto';
import { OtpVerifyAuthDto } from './dto/otp-verification.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly prismaRepository: PrismaService,
    private readonly userService: UsersService,
    private readonly mailHelper: MailerService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signUpAuthDto: SignUpAuthDto) {
    try {
      const hashPass = await bcrypt.hash(signUpAuthDto.password, 10);
      const user = await this.userService.create({
        ...signUpAuthDto,
        password: hashPass,
      });
      const otp = await generateOtp();
      await sendEmail(
        this.mailHelper,
        user.email,
        'Welcome to Our Platform',
        'Thank you for registering!',
        `<h1>Welcome!</h1><p>We are glad to have you on board.<br>Here is your otp code and don't give it to others please: ${otp}</p>`,
      );
      await this.prismaRepository.otp.create({
        data: {
          otp_code: otp,
          user_id: user.id,
        },
      });
      await this.redis.set(user.email, otp);
      return {
        message: 'Registration successful',
        user_id: user.id,
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async signin(signInAuthDto: SignInAuthDto) {
    try {
      const getUser = await this.userService.findByEmail(signInAuthDto.email);
      if (getUser.isActive == false) {
        throw new BadRequestException('Your account not verified');
      }
      const check = await bcrypt.compare(
        signInAuthDto.password,
        getUser.password,
      );
      if (!check) {
        throw new BadRequestException('Password or email not suit');
      }
      const accessPayload = {
        sub: getUser.id,
        fullname: getUser.fullname,
        email: getUser.email,
        role: getUser.role,
      };
      const refreshPayload = {
        sub: getUser.id,
        email: getUser.email,
        role: getUser.role,
      };
      const accessToken = await this.jwtService.signAsync(accessPayload);
      const refreshToken = await this.jwtService.signAsync(refreshPayload);
      await this.userService.saveToken(getUser.id, refreshToken);
      return {
        message: 'User signed in',
        accessToken,
        refreshToken,
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async verifyOTP(otpVerifyDto: OtpVerifyAuthDto) {
    try {
      const findUser = await this.userService.findByEmail(otpVerifyDto.email);
      const otpData = await this.prismaRepository.otp.findFirst({
        where: {
          user_id: findUser.id,
        },
      });
      if (!otpData) {
        throw new NotFoundException('Otp not found or expired already');
      }
      if (otpData.otp_code == otpVerifyDto.otp_code) {
        await this.userService.activateUser(otpVerifyDto.email);
        await this.prismaRepository.otp.delete({
          where: { id: otpData.id },
        });
        await this.redis.del(otpVerifyDto.email);
        return {
          message: 'OTP verified',
        };
      }
      throw new BadRequestException('OTP not suit');
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordAuthDto) {
    try {
      const findUser = await this.userService.findByEmail(
        resetPasswordDto.email,
      );
      const isChecked = await bcrypt.compare(
        resetPasswordDto.oldPassword,
        findUser.password,
      );
      if (isChecked) {
        await this.userService.updatePassword(
          resetPasswordDto.email,
          await bcrypt.hash(resetPasswordDto.password, 10),
        );
        return {
          message: 'Password updated successfully',
        };
      }
      throw new BadRequestException('Old password not suit');
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private handlePrismaError(error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          throw new ConflictException('Unique constraint failed');
        case 'P2025':
          throw new NotFoundException('Record not found');
        default:
          throw new InternalServerErrorException('A database error occurred');
      }
    } else {
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }
}

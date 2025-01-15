import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { SignInAuthDto } from './dto/signin-auth.dto';
import { UsersService } from '../users/users.service';
import { SignUpAuthDto } from '../users/dto/create-user.dto';
import { generateOtp } from '../helpers/otp';
import { sendEmail } from '../helpers/sendMail';
import { OTP } from '../auth/entities/otp.entity';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(OTP) private otpRepositories: Repository<OTP>,
    @InjectRedis() private readonly redis: Redis,
    private readonly userService: UsersService,
    private readonly mailHelper: MailerService,
    private readonly jwtService: JwtService,
  ) {}
  async signup(signUpAuthDto: SignUpAuthDto) {
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
    const otpdata = this.otpRepositories.create({
      otp_code: otp,
      user_id: user.id,
    });
    await this.otpRepositories.save(otpdata);
    await this.redis.set(user.email, otp);
    return {
      message: 'Registration successful',
      user_id: user.id,
    };
  }

  async signin(signInAuthDto: SignInAuthDto) {
    const getUser = await this.userService.findByEmail(signInAuthDto.email);
    if (getUser.isActive == false) {
      throw new BadRequestException('Your account not verified');
    }
    const check = await bcrypt.compare(
      signInAuthDto.password,
      getUser.password,
    );
    if (!check) {
      throw new BadRequestException('Password or email  not suit');
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
      accessToken,
      refreshToken,
    };
  }

  async verifyOTP(email: string, otp_code: string) {
    const findUser = await this.userService.findByEmail(email);
    const otpData = await this.otpRepositories.findOneBy({
      user_id: findUser.id,
    });
    if (!otpData) {
      throw new NotFoundException('Otp not found or expired already');
    }
    if (otpData.otp_code == otp_code) {
      await this.userService.activateUser(email);
      await this.otpRepositories.delete({ user_id: findUser.id });
      await this.redis.del(email);
      return {
        messsage: 'User successfully verified',
      };
    }
    throw new BadRequestException('OTP not suit');
  }
  async resetPassword(email: string, oldPassword: string, password: string) {
    const findUser = await this.userService.findByEmail(email);
    if (findUser.password == oldPassword) {
      await this.userService.updatePassword(email, password);
    }
  }
}

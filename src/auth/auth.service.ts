import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
// import { ForgetPasswordAuthDto } from './dto/forget-password.dto';
import { SignInAuthDto } from './dto/signin-auth.dto';
import { UsersService } from '../users/users.service';
import { SignUpAuthDto } from '../users/dto/create-user.dto';
import { generateOtp } from '../helpers/otp';
import { MailerService } from '@nestjs-modules/mailer';
import { sendEmail } from 'src/helpers/sendMail';
import { InjectRepository } from '@nestjs/typeorm';
import { OTP } from '../auth/entities/otp.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(OTP) private otpRepositories: Repository<OTP>,
    private readonly userService: UsersService,
    private readonly mailHelper: MailerService,
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
  }

  async findAll() {}

  async findOne(id: number) {}

  async update(id: number, updateAuthDto: SignInAuthDto) {}

  async remove(id: number) {}
}

import { Controller, Get, Post, Body, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpAuthDto } from '../users/dto/create-user.dto';
import { SignInAuthDto } from './dto/signin-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('signup')
  async signup(@Body() createAuthDto: SignUpAuthDto) {
    return await this.authService.signup(createAuthDto);
  }
  @Post('signin')
  async signin(@Body() signInAuthDto: SignInAuthDto) {
    return await this.authService.signin(signInAuthDto);
  }
  @Get('verify')
  async verify(
    @Body('email') email: string,
    @Body('otp_code') otp_code: string,
  ) {
    return await this.authService.verifyOTP(email, otp_code);
  }
  @Put('reset-password')
  async resetPass(
    @Body('email') email: string,
    @Body('oldPassword') oldPassword: string,
    @Body('password') password: string,
  ) {
    return await this.authService.resetPassword(email, oldPassword, password);
  }
}

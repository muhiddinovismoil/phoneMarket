import { Controller, Get, Post, Body, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpAuthDto } from '../users/dto/create-user.dto';
import { SignInAuthDto } from './dto/signin-auth.dto';
import { ResetPasswordAuthDto } from './dto/reset-password.dto';
import { OtpVerifyAuthDto } from './dto/otp-verification.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @ApiOperation({ summary: 'Sign up user' })
  @ApiCreatedResponse({ description: 'Registration successful' })
  @ApiBadRequestResponse({ description: 'User already exists' })
  @ApiBody({ type: SignUpAuthDto })
  @Post('signup')
  async signup(@Body() createAuthDto: SignUpAuthDto) {
    return await this.authService.signup(createAuthDto);
  }
  @ApiOperation({ summary: 'Sign in user' })
  @ApiOkResponse({ description: 'User signed in' })
  @ApiBadRequestResponse({ description: 'Your account not verified' })
  @ApiBadRequestResponse({ description: 'Password or email  not suit' })
  @ApiBody({ type: SignInAuthDto })
  @Post('signin')
  async signin(@Body() signInAuthDto: SignInAuthDto) {
    return await this.authService.signin(signInAuthDto);
  }
  @ApiOperation({ summary: 'Verify OTP' })
  @ApiOkResponse({ description: 'OTP verified' })
  @ApiBadRequestResponse({ description: 'OTP not valid' })
  @ApiNotFoundResponse({ description: 'Otp not found or expired already' })
  @ApiBody({ type: OtpVerifyAuthDto })
  @Get('verify')
  async verify(@Body() otpVerifyDto: OtpVerifyAuthDto) {
    return await this.authService.verifyOTP(otpVerifyDto);
  }
  @ApiOperation({ summary: 'Reset password' })
  @ApiOkResponse({ description: 'Password reset' })
  @ApiBadRequestResponse({ description: 'Old password not suit' })
  @ApiBody({ type: ResetPasswordAuthDto })
  @Put('reset-password')
  async resetPass(@Body() resetPasswordDto: ResetPasswordAuthDto) {
    return await this.authService.resetPassword(resetPasswordDto);
  }
}

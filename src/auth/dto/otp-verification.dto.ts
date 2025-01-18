import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class OtpVerifyAuthDto {
  @IsEmail()
  @ApiProperty({ example: 'example@gmail.com' })
  email: string;
  @IsString()
  @ApiProperty({ example: 'qG3d1e' })
  otp_code: string;
}

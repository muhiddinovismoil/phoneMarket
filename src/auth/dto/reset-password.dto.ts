import { IsEmail, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class ResetPasswordAuthDto {
  @IsEmail()
  @ApiProperty({ example: 'example@gmail.com' })
  email: string;
  @IsStrongPassword()
  @ApiProperty({ example: 'Wasf@adse3' })
  oldPassword: string;
  @IsStrongPassword()
  @ApiProperty({ example: 'qwetwe' })
  password: string;
}

import { IsEmail, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class SignInAuthDto {
  @IsEmail()
  @ApiProperty({ example: 'example@gmail.com' })
  email: string;
  @IsStrongPassword()
  @ApiProperty({ example: 'Wasf@adse3' })
  password: string;
}

import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';
export class SignUpAuthDto {
  @IsString()
  @ApiProperty({ example: 'John Doe' })
  fullname: string;
  @IsEmail()
  @ApiProperty({ example: 'johndoe@mail.com' })
  email: string;
  @IsStrongPassword()
  @ApiProperty({ example: 'Qwert124@' })
  password: string;
  @IsPhoneNumber()
  @ApiProperty({ example: '+112341251234' })
  phone_number: string;
}

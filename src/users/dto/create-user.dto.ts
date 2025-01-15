import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsStrongPassword,
  MaxLength,
} from 'class-validator';
export class SignUpAuthDto {
  @IsString()
  @MaxLength(50)
  @ApiProperty({ example: 'John Doe' })
  fullname: string;
  @IsEmail()
  @MaxLength(50)
  @ApiProperty({ example: 'johndoe@mail.com' })
  email: string;
  @IsStrongPassword()
  @MaxLength(50)
  @ApiProperty({ example: 'Qwert124@' })
  password: string;
  @IsString()
  @MaxLength(50)
  @ApiProperty({ example: '+112341251234' })
  phone_number: string;
}

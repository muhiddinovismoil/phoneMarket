import { PartialType } from '@nestjs/mapped-types';
import { SignUpAuthDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(SignUpAuthDto) {}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpAuthDto } from '../users/dto/create-user.dto';
import { SignInAuthDto } from './dto/signin-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post()
  create(@Body() createAuthDto: SignUpAuthDto) {
    return this.authService.signup(createAuthDto);
  }
  @Get()
  findAll() {
    return this.authService.findAll();
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: SignInAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}

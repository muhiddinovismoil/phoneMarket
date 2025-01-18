import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { SignUpAuthDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from 'src/constants/paginationDto/pagination.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/constants/decorator/role.decorator';
import { Role } from 'src/constants/enums/roles';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  // ================================
  // CREATE USER ENDPOINT
  @ApiOperation({ summary: 'Create user' })
  @ApiBody({ type: SignUpAuthDto })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized token not valid' })
  @ApiForbiddenResponse({
    description: 'Forbidden You have no access to do it',
  })
  @ApiOkResponse({ description: 'User created' })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.admin, Role.superAdmin)
  @Post()
  async create(@Body() createUserDto: SignUpAuthDto) {
    return await this.usersService.create(createUserDto);
  }
  // ================================
  // GET ALL USERS ENDPOINT
  // ================================
  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({ name: 'page', description: 'GET USERS' })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized token not valid' })
  @ApiForbiddenResponse({
    description: 'Forbidden You have no access to do it',
  })
  @ApiOkResponse({ description: 'Users found' })
  @ApiNotFoundResponse({ description: 'Users not found' })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.admin)
  @Throttle({ default: { limit: 10, ttl: 10000 } })
  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.usersService.findAll(paginationDto);
  }
  // ================================
  // GET USER BY ID ENDPOINT
  // ================================
  @ApiOperation({ summary: 'Get user by id' })
  @ApiParam({ name: 'id', type: String, description: 'User id' })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized token not valid' })
  @ApiOkResponse({ description: 'User found' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.usersService.findOne(id);
  }
  // ================================
  // UPDATE USER ENDPOINT
  // ================================
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', type: String, description: 'User id' })
  @ApiBody({ type: SignUpAuthDto })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized token not valid' })
  @ApiForbiddenResponse({
    description: 'Forbidden You have no access to do it',
  })
  @ApiOkResponse({ description: 'User updated' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.admin)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(id, updateUserDto);
  }
  // ================================
  // DELETE USER ENDPOINT
  // ================================
  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({ name: 'id', type: String, description: 'User id' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'User deleted' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized token not valid' })
  @ApiForbiddenResponse({
    description: 'Forbidden You have no access to do it',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.superAdmin)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.usersService.remove(id);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { SignUpAuthDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users) private userRepository: Repository<Users>,
  ) {}
  async create(createUserDto: SignUpAuthDto) {
    const newUser = await this.userRepository.save(createUserDto);
    return newUser;
  }
  async findAll() {
    const allUser = await this.userRepository.find();
    if (allUser.length == 0) {
      throw new NotFoundException('Data not found');
    }
    return allUser;
  }
  async findOne(id: string) {
    const findUser = await this.userRepository.findOneBy({ id });
    if (!findUser) {
      throw new NotFoundException('User not found');
    }
    return findUser;
  }
  async findByEmail(email: string) {
    const findUserByEmail = await this.userRepository.findOneBy({ email });
    if (!findUserByEmail) {
      throw new NotFoundException('User not found');
    }
    return findUserByEmail;
  }
  async update(id: string, updateUserDto: UpdateUserDto) {
    const getUser = await this.userRepository.findOneBy({ id });
    if (!getUser) {
      throw new NotFoundException('User not found');
    }
    await this.userRepository.update(id, updateUserDto);
    return {
      message: 'Updated',
      user_id: getUser.id,
    };
  }
  async activateUser(email: string) {
    const findUser = await this.userRepository.findOneBy({ email });
    if (!findUser) {
      throw new NotFoundException('Data not found');
    }
    await this.userRepository.update(email, { isActive: true });
    return {
      message: 'User Account activated',
    };
  }
  async saveToken(id: string, refreshToken: string) {
    await this.userRepository.update(id, { refresh_token: refreshToken });
  }
  async updatePassword(email: string, password: string) {
    await this.userRepository.update(email, { password: password });
    return {
      message: 'User password resetted successfully',
    };
  }
  async remove(id: string) {
    const findUser = await this.userRepository.findOneBy({ id });
    if (!findUser) {
      throw new NotFoundException('User is not found');
    }
    await this.userRepository.delete(id);
    return {
      message: 'Deleted',
      user_id: findUser.id,
    };
  }
}

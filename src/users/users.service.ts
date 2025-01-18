import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SignUpAuthDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { PaginationDto } from 'src/constants/paginationDto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users) private userRepository: Repository<Users>,
    @InjectRedis() private readonly redis: Redis,
  ) {}
  async create(createUserDto: SignUpAuthDto) {
    const getUser = await this.userRepository.findOneBy({
      email: createUserDto.email,
    });
    if (!getUser) {
      const newUser = await this.userRepository.save(createUserDto);
      await this.redis.set(newUser.id, JSON.stringify(newUser));
      return newUser;
    } else {
      throw new BadRequestException('User already exists');
    }
  }
  async findByEmail(email: string) {
    const loginUser = await this.userRepository.findOneBy({ email });
    if (!loginUser) {
      throw new NotFoundException('User not found');
    }
    return loginUser;
  }
  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 5 } = paginationDto;
    const offset = (page - 1) * limit;
    const cacheKey = `users:page=${page}:limit=${limit}`;
    const cachedData = await this.redis.get(cacheKey);
    if (cachedData) {
      return {
        message: 'All Users',
        users: JSON.parse(cachedData),
      };
    } else {
      const allUser = await this.userRepository.find({
        skip: offset,
        take: limit,
        select: {
          id: true,
          fullname: true,
          email: true,
          phone_number: true,
          role: true,
          isActive: true,
          refresh_token: true,
        },
        relations: {
          orders: true,
        },
      });
      if (allUser.length == 0) {
        throw new NotFoundException('Data not found');
      }
      await this.redis.set(cacheKey, JSON.stringify(allUser));
      return {
        message: 'All User',
        users: allUser,
      };
    }
  }
  async findOne(id: string) {
    const findUser = await this.userRepository.findOne({
      where: { id },
      select: {
        id: true,
        fullname: true,
        email: true,
        phone_number: true,
        role: true,
        isActive: true,
        refresh_token: true,
        orders: true,
      },
      relations: ['orders'],
    });
    if (!findUser) {
      throw new NotFoundException('User not found');
    }
    return findUser;
  }
  async update(id: string, updateUserDto: UpdateUserDto) {
    const getUser = await this.userRepository.findOneBy({ id });
    if (!getUser) {
      throw new NotFoundException('User not found');
    }
    await this.userRepository.update(id, updateUserDto);
    await this.redis.set(id, JSON.stringify({ ...getUser, ...updateUserDto }));
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
    await this.userRepository.update({ email: email }, { isActive: true });
    await this.redis.set(
      email,
      JSON.stringify({ ...findUser, isActive: true }),
    );
    return {
      message: 'User Account activated',
    };
  }
  async saveToken(id: string, refreshToken: string) {
    await this.userRepository.update(id, { refresh_token: refreshToken });
    await this.redis.set(id, JSON.stringify({ refresh_token: refreshToken }));
  }
  async updatePassword(email: string, password: string) {
    await this.userRepository.update({ email: email }, { password: password });
    await this.redis.set(email, JSON.stringify({ password: password }));
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
    await this.redis.del(id);
    return {
      message: 'Deleted',
      user_id: findUser.id,
    };
  }
}

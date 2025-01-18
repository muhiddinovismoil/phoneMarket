import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SignUpAuthDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { PaginationDto } from 'src/constants/paginationDto/pagination.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaRepository: PrismaService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async create(createUserDto: SignUpAuthDto) {
    try {
      const getUser = await this.prismaRepository.users.findUnique({
        where: {
          email: createUserDto.email,
        },
      });
      if (!getUser) {
        const newUser = await this.prismaRepository.users.create({
          data: { ...createUserDto },
        });
        await this.redis.set(newUser.id, JSON.stringify(newUser));
        return newUser;
      } else {
        throw new BadRequestException('User already exists');
      }
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findByEmail(email: string) {
    try {
      const loginUser = await this.prismaRepository.users.findUnique({
        where: { email },
      });
      if (!loginUser) {
        throw new NotFoundException('User not found');
      }
      return loginUser;
    } catch (error) {
      this.handlePrismaError(error);
    }
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
      try {
        const allUser = await this.prismaRepository.users.findMany({
          skip: offset,
          take: limit,
          include: {
            orders: true,
          },
        });
        const allUserWithoutPassword = allUser.map((user) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { password, ...userWithoutPassword } = user;
          return userWithoutPassword;
        });

        if (allUserWithoutPassword.length === 0) {
          throw new NotFoundException('Data not found');
        }
        await this.redis.set(cacheKey, JSON.stringify(allUserWithoutPassword));
        return {
          message: 'All User',
          users: allUserWithoutPassword,
        };
      } catch (error) {
        this.handlePrismaError(error);
      }
    }
  }

  async findOne(id: string) {
    try {
      const findUser = await this.prismaRepository.users.findUnique({
        where: { id },
        include: {
          orders: true,
        },
      });
      if (!findUser) {
        throw new NotFoundException('User not found');
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = findUser;
      return userWithoutPassword;
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const getUser = await this.prismaRepository.users.findUnique({
        where: { id },
      });
      if (!getUser) {
        throw new NotFoundException('User not found');
      }
      await this.prismaRepository.users.update({
        where: { id },
        data: { ...updateUserDto },
      });
      await this.redis.set(
        id,
        JSON.stringify({ ...getUser, ...updateUserDto }),
      );
      return {
        message: 'Updated',
        user_id: getUser.id,
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async activateUser(email: string) {
    try {
      const findUser = await this.prismaRepository.users.findUnique({
        where: { email },
      });
      if (!findUser) {
        throw new NotFoundException('Data not found');
      }
      await this.prismaRepository.users.update({
        where: { email: email },
        data: { isActive: true },
      });
      await this.redis.set(
        email,
        JSON.stringify({ ...findUser, isActive: true }),
      );
      return {
        message: 'User Account activated',
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async saveToken(id: string, refreshToken: string) {
    try {
      await this.prismaRepository.users.update({
        where: { id },
        data: {
          refresh_token: refreshToken,
        },
      });
      await this.redis.set(id, JSON.stringify({ refresh_token: refreshToken }));
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async updatePassword(email: string, password: string) {
    try {
      await this.prismaRepository.users.update({
        where: { email: email },
        data: { password: password },
      });
      await this.redis.set(email, JSON.stringify({ password: password }));
      return {
        message: 'User password reset successfully',
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: string) {
    try {
      const findUser = await this.prismaRepository.users.findUnique({
        where: { id },
      });
      if (!findUser) {
        throw new NotFoundException('User is not found');
      }
      await this.prismaRepository.users.delete({ where: { id } });
      await this.redis.del(id);
      return {
        message: 'Deleted',
        user_id: findUser.id,
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }
  private handlePrismaError(error: any) {
    if (error instanceof PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          throw new ConflictException('Unique constraint failed');
        case 'P2025':
          throw new NotFoundException('Record not found');
        default:
          throw new InternalServerErrorException('A database error occurred');
      }
    } else {
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }
}

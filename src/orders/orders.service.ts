import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { PaginationDto } from 'src/constants/paginationDto/pagination.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prismaRepository: PrismaService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    try {
      const newOrder = await this.prismaRepository.order.create({
        data: { ...createOrderDto },
      });
      await this.redis.set(newOrder.id, JSON.stringify(newOrder));
      return {
        message: 'New Order created',
        orderId: newOrder.id,
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 5, search, filter } = paginationDto;
    const offset = (page - 1) * limit;
    const cacheKey = `orders:page=${page}:limit=${limit}:search=${search}:filter=${filter}`;
    const cachedData = await this.redis.get(cacheKey);
    if (cachedData) {
      return {
        message: 'All Orders',
        orders: JSON.parse(cachedData),
      };
    } else {
      try {
        const queryOptions: any = {
          skip: offset,
          take: limit,
          where: {},
          include: {
            orderProducts: true,
          },
        };
        if (search) {
          queryOptions.where.total_price = {
            contains: search,
            mode: 'insensitive',
          };
        }
        if (filter) {
          const filterConditions: any = {};
          if (filter.total_price) {
            filterConditions.total_price = {
              contains: filter.total_price,
              mode: 'insensitive',
            };
          }
          if (filter.status) {
            filterConditions.status = {
              contains: filter.status,
              mode: 'insensitive',
            };
          }
          if (Object.keys(filterConditions).length > 0) {
            queryOptions.where = { ...queryOptions.where, ...filterConditions };
          }
        }
        const getAllOrders =
          await this.prismaRepository.order.findMany(queryOptions);
        if (getAllOrders.length === 0) {
          throw new NotFoundException('Orders not found');
        }
        await this.redis.set(cacheKey, JSON.stringify(getAllOrders));
        return {
          message: 'All Orders',
          orders: getAllOrders,
        };
      } catch (error) {
        this.handlePrismaError(error);
      }
    }
  }

  async findOne(id: string) {
    const cachedData = await this.redis.get(id);
    if (cachedData) {
      return {
        message: 'One Order',
        order: JSON.parse(cachedData),
      };
    }
    try {
      const getOrder = await this.prismaRepository.order.findUnique({
        where: { id },
      });
      if (!getOrder) {
        throw new NotFoundException('Order not found');
      }
      await this.redis.set(id, JSON.stringify(getOrder));
      return {
        message: 'One Order',
        order: getOrder,
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    try {
      const findOrder = await this.prismaRepository.order.findUnique({
        where: { id },
      });
      if (!findOrder) {
        throw new NotFoundException('Order not found');
      }
      const updatedOrder = await this.prismaRepository.order.update({
        where: { id: id },
        data: { ...updateOrderDto },
      });
      await this.redis.set(id, JSON.stringify(updatedOrder));
      return {
        message: 'Order updated',
        orderId: updatedOrder.id,
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: string) {
    try {
      const findOrder = await this.prismaRepository.order.findUnique({
        where: { id },
      });
      if (!findOrder) {
        throw new NotFoundException('Order not found');
      }
      await this.prismaRepository.order.delete({ where: { id: id } });
      await this.redis.del(id);
      return {
        message: 'Order deleted',
        orderId: findOrder.id,
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private handlePrismaError(error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
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

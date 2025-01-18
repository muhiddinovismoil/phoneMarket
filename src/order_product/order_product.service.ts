import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateOrderProductDto } from './dto/create-order_product.dto';
import { UpdateOrderProductDto } from './dto/update-order_product.dto';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { PaginationDto } from 'src/constants/paginationDto/pagination.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class OrderProductService {
  constructor(
    private readonly prismaRepository: PrismaService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async create(createOrderProductDto: CreateOrderProductDto) {
    try {
      const newOrderProduct = await this.prismaRepository.order_products.create(
        {
          data: {
            ...createOrderProductDto,
          },
        },
      );
      await this.redis.set(newOrderProduct.id, JSON.stringify(newOrderProduct));
      return {
        message: 'Order product created successfully',
        order_productId: newOrderProduct.id,
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 5 } = paginationDto;
    const offset = (page - 1) * limit;
    const cacheKey = `order-product:page=${page}:limit=${limit}`;
    const cachedData = await this.redis.get(cacheKey);
    if (cachedData) {
      return {
        message: 'All Order Products',
        order_products: JSON.parse(cachedData),
      };
    } else {
      try {
        const getAllOrderProduct =
          await this.prismaRepository.order_products.findMany({
            skip: offset,
            take: limit,
            include: {
              order: true,
              product: true,
            },
          });
        if (getAllOrderProduct.length === 0) {
          throw new NotFoundException('No order product found');
        }
        await this.redis.set(cacheKey, JSON.stringify(getAllOrderProduct));
        return {
          message: 'All order product',
          order_products: getAllOrderProduct,
        };
      } catch (error) {
        this.handlePrismaError(error);
      }
    }
  }

  async findOne(id: string) {
    const getCachedData = await this.redis.get(id);
    if (getCachedData) {
      return {
        message: 'Order product detail',
        order_product: JSON.parse(getCachedData),
      };
    }
    try {
      const getOrderProduct =
        await this.prismaRepository.order_products.findUnique({
          where: { id },
          include: {
            order: true,
            product: true,
          },
        });
      if (!getOrderProduct) {
        throw new NotFoundException('Order product not found');
      }
      await this.redis.set(id, JSON.stringify(getOrderProduct));
      return {
        message: 'Order product detail',
        order_product: getOrderProduct,
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async update(id: string, updateOrderProductDto: UpdateOrderProductDto) {
    try {
      const getOrderProduct =
        await this.prismaRepository.order_products.findUnique({
          where: { id },
        });
      if (!getOrderProduct) {
        throw new NotFoundException('Order product not found');
      }
      const updatedOrderProduct =
        await this.prismaRepository.order_products.update({
          where: { id: getOrderProduct.id },
          data: { ...updateOrderProductDto },
        });
      await this.redis.set(id, JSON.stringify(updatedOrderProduct));
      return {
        message: 'Order product updated successfully',
        order_productId: updatedOrderProduct.id,
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: string) {
    try {
      const getOrderProduct =
        await this.prismaRepository.order_products.findUnique({
          where: { id },
        });
      if (!getOrderProduct) {
        throw new NotFoundException('Order product not found');
      }
      await this.prismaRepository.order_products.delete({
        where: { id: getOrderProduct.id },
      });
      await this.redis.del(id);
      return {
        message: 'Order product deleted successfully',
        order_productId: getOrderProduct.id,
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

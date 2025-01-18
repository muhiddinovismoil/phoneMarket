import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { PaginationDto } from '../constants/paginationDto/pagination.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prismaRepository: PrismaService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const newProduct = await this.prismaRepository.product.create({
        data: { ...createProductDto },
      });
      await this.redis.set(newProduct.id, JSON.stringify(newProduct));
      return {
        message: 'Product successfully added',
        productId: newProduct.id,
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 5, search, filter } = paginationDto;
    const offset = (page - 1) * limit;
    const cacheKey = `products:page=${page}:limit=${limit}:search=${search}:filter=${filter}`;
    const cachedData = await this.redis.get(cacheKey);
    if (cachedData) {
      return {
        message: 'All Products',
        products: JSON.parse(cachedData),
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
          queryOptions.where.name = {
            contains: search,
            mode: 'insensitive',
          };
        }
        if (filter) {
          const filterConditions: any = {};
          if (filter.name) {
            filterConditions.name = {
              contains: filter.name,
              mode: 'insensitive',
            };
          }
          if (filter.price) {
            filterConditions.price = filter.price;
          }
          if (filter.info) {
            filterConditions.info = {
              contains: filter.info,
              mode: 'insensitive',
            };
          }
          if (Object.keys(filterConditions).length > 0) {
            queryOptions.where = { ...queryOptions.where, ...filterConditions };
          }
        }
        const getProducts =
          await this.prismaRepository.product.findMany(queryOptions);
        if (getProducts.length === 0) {
          throw new NotFoundException('Products not found');
        }
        await this.redis.set(cacheKey, JSON.stringify(getProducts));
        return {
          message: 'All Products',
          products: getProducts,
        };
      } catch (error) {
        this.handlePrismaError(error);
      }
    }
  }

  async findOne(id: string) {
    const redisData = await this.redis.get(id);
    if (redisData) {
      return {
        message: 'One Product',
        product: JSON.parse(redisData),
      };
    }
    try {
      const getProduct = await this.prismaRepository.product.findUnique({
        where: { id },
        include: {
          orderProducts: true,
        },
      });
      if (!getProduct) {
        throw new NotFoundException('Product not found');
      }
      await this.redis.set(id, JSON.stringify(getProduct));
      return {
        message: 'One Product',
        product: getProduct,
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      const getData = await this.prismaRepository.product.findUnique({
        where: { id },
      });
      if (!getData) {
        throw new NotFoundException('Product not found');
      }
      const updatedProduct = await this.prismaRepository.product.update({
        where: { id },
        data: { ...updateProductDto },
      });
      await this.redis.set(id, JSON.stringify(updatedProduct));
      return {
        message: 'Product updated',
        productId: updatedProduct.id,
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: string) {
    try {
      const getData = await this.prismaRepository.product.findUnique({
        where: { id },
      });
      if (!getData) {
        throw new NotFoundException('Product not found');
      }
      await this.prismaRepository.product.delete({
        where: { id },
      });
      await this.redis.del(id);
      return {
        message: 'Product deleted',
        productId: getData.id,
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

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderProductDto } from './dto/create-order_product.dto';
import { UpdateOrderProductDto } from './dto/update-order_product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderProducts } from './entities/order_product.entity';
import { Repository } from 'typeorm';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { PaginationDto } from 'src/constants/paginationDto/pagination.dto';

@Injectable()
export class OrderProductService {
  constructor(
    @InjectRepository(OrderProducts)
    private orderProductRepository: Repository<OrderProducts>,
    @InjectRedis() private readonly redis: Redis,
  ) {}
  async create(createOrderProductDto: CreateOrderProductDto) {
    const newOrderProduct = await this.orderProductRepository.create({
      ...createOrderProductDto,
    });
    await this.redis.set(newOrderProduct.id, JSON.stringify(newOrderProduct));
    await this.orderProductRepository.save(newOrderProduct);
    return {
      message: 'Order product created successfully',
      order_productId: newOrderProduct.id,
    };
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
      const getAllOrderProduct = await this.orderProductRepository.find({
        skip: offset,
        take: limit,
      });
      if (getAllOrderProduct.length === 0) {
        throw new NotFoundException('No order product found');
      }
      await this.redis.set(cacheKey, JSON.stringify(getAllOrderProduct));
      return {
        message: 'All order product',
        order_products: getAllOrderProduct,
      };
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
    const getOrderProduct = await this.orderProductRepository.findOneBy({ id });
    if (!getOrderProduct) {
      throw new NotFoundException('Order product not found');
    }
    await this.redis.set(id, JSON.stringify(getOrderProduct));
    return {
      message: 'Order product detail',
      order_product: getOrderProduct,
    };
  }

  async update(id: string, updateOrderProductDto: UpdateOrderProductDto) {
    const getOrderProduct = await this.orderProductRepository.findOneBy({ id });
    if (!getOrderProduct) {
      throw new NotFoundException('Order product not found');
    }
    await this.orderProductRepository.update(
      { id: getOrderProduct.id },
      { ...updateOrderProductDto },
    );
    await this.redis.set(
      id,
      JSON.stringify({ ...getOrderProduct, ...updateOrderProductDto }),
    );
    return {
      message: 'Order product updated successfully',
      order_productId: getOrderProduct.id,
    };
  }

  async remove(id: string) {
    const getOrderProduct = await this.orderProductRepository.findOneBy({ id });
    if (!getOrderProduct) {
      throw new NotFoundException('Order product not found');
    }
    await this.orderProductRepository.delete({ id: getOrderProduct.id });
    await this.redis.del(id);
    return {
      message: 'Order product deleted successfully',
      order_productId: getOrderProduct.id,
    };
  }
}

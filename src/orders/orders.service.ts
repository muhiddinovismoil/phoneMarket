import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Orders } from './entities/order.entity';
import { Repository } from 'typeorm';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { PaginationDto } from 'src/constants/paginationDto/pagination.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Orders) private orderRepository: Repository<Orders>,
    @InjectRedis() private readonly redis: Redis,
  ) {}
  async create(createOrderDto: CreateOrderDto) {
    const newOrder = this.orderRepository.create({ ...createOrderDto });
    await this.redis.set(newOrder.id, JSON.stringify(newOrder));
    await this.orderRepository.save(newOrder);
    return {
      message: 'New Order created',
      orderId: newOrder.id,
    };
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 5 } = paginationDto;
    const offset = (page - 1) * limit;
    const cacheKey = `orders:page=${page}:limit=${limit}`;
    const cachedData = await this.redis.get(cacheKey);
    if (cachedData) {
      return {
        message: 'All Orders',
        orders: JSON.parse(cachedData),
      };
    } else {
      const getAllOrders = await this.orderRepository.find({
        skip: offset,
        take: limit,
      });
      if (getAllOrders.length === 0) {
        throw new NotFoundException('Orders not found');
      }
      await this.redis.set(cacheKey, JSON.stringify(getAllOrders));
      return {
        message: 'All Orders',
        orders: getAllOrders,
      };
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
    const getOrder = await this.orderRepository.findOneBy({ id });
    if (!getOrder) {
      throw new NotFoundException('Order not found');
    }
    await this.redis.set(id, JSON.stringify(getOrder));
    return {
      message: 'One Order',
      order: getOrder,
    };
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const findOrder = await this.orderRepository.findOneBy({ id });
    if (!findOrder) {
      throw new NotFoundException('Order not found');
    }
    await this.orderRepository.update({ id: id }, { ...updateOrderDto });
    await this.redis.set(
      id,
      JSON.stringify({ ...findOrder, ...updateOrderDto }),
    );
    return {
      message: 'Order updated',
      orderId: findOrder.id,
    };
  }

  async remove(id: string) {
    const findOrder = await this.orderRepository.findOneBy({ id });
    if (!findOrder) {
      throw new NotFoundException('Order not found');
    }
    await this.orderRepository.delete({ id: id });
    await this.redis.del(id);
    return {
      message: 'Order deleted',
      orderId: findOrder.id,
    };
  }
}

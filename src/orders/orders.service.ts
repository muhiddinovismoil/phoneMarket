import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Orders } from './entities/order.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Orders) private orderRepository: Repository<Orders>,
  ) {}
  async create(createOrderDto: CreateOrderDto) {
    const newOrder = this.orderRepository.create({ ...createOrderDto });
    await this.orderRepository.save(newOrder);
    return {
      message: 'New Order created',
      orderId: newOrder.id,
    };
  }

  async findAll() {
    const getAllOrders = await this.orderRepository.find();
    if (getAllOrders.length === 0) {
      throw new NotFoundException('Orders not found');
    }
    return {
      message: 'All Orders',
      orders: getAllOrders,
    };
  }

  async findOne(id: string) {
    const getOrder = await this.orderRepository.findOneBy({ id });
    if (!getOrder) {
      throw new NotFoundException('Order not found');
    }
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
    return {
      message: 'Order deleted',
      orderId: findOrder.id,
    };
  }
}

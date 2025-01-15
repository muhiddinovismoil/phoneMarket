import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderProductDto } from './dto/create-order_product.dto';
import { UpdateOrderProductDto } from './dto/update-order_product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderProducts } from './entities/order_product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OrderProductService {
  constructor(
    @InjectRepository(OrderProducts)
    private orderProductRepository: Repository<OrderProducts>,
  ) {}
  async create(createOrderProductDto: CreateOrderProductDto) {
    const newOrderProduct = await this.orderProductRepository.create({
      ...createOrderProductDto,
    });
    await this.orderProductRepository.save(newOrderProduct);
    return {
      message: 'Order product created successfully',
      order_productId: newOrderProduct.id,
    };
  }

  async findAll() {
    const getAllOrderProduct = await this.orderProductRepository.find();
    if (getAllOrderProduct.length === 0) {
      throw new NotFoundException('No order product found');
    }
    return {
      message: 'All order product',
      order_products: getAllOrderProduct,
    };
  }

  async findOne(id: string) {
    const getOrderProduct = await this.orderProductRepository.findOneBy({ id });
    if (!getOrderProduct) {
      throw new NotFoundException('Order product not found');
    }
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
    return {
      message: 'Order product deleted successfully',
      order_productId: getOrderProduct.id,
    };
  }
}

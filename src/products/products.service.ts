import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Products } from './entities/product.entity';
import { Repository } from 'typeorm';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Products) private productRepository: Repository<Products>,
    @InjectRedis() private readonly redis: Redis,
  ) {}
  async create(createProductDto: CreateProductDto) {
    const newProduct = await this.productRepository.create({
      ...createProductDto,
    });
    await this.redis.set(newProduct.id, JSON.stringify(newProduct));
    await this.productRepository.save(newProduct);
    return {
      message: 'Product successfully added',
      productId: newProduct.id,
    };
  }
  async findAll() {
    const redisData = await this.redis.keys('*');
    if (redisData.length > 0) {
      const products = await this.redis.mget(redisData);
      return {
        message: 'All Products',
        products: products.map((product) => JSON.parse(product)),
      };
    } else {
      const getProducts = await this.productRepository.find();
      if (getProducts.length === 0) {
        throw new NotFoundException('Products not found');
      }
      getProducts.forEach(async (product) => {
        await this.redis.set(product.id, JSON.stringify(product));
      });
      return {
        message: 'All Prodcuts',
        products: getProducts,
      };
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
    const getProduct = await this.productRepository.findOneBy({ id });
    if (getProduct) {
      throw new NotFoundException('Product not found');
    }
    await this.redis.set(id, JSON.stringify(getProduct));
    return {
      message: 'One Product',
      product: getProduct,
    };
  }
  async update(id: string, updateProductDto: UpdateProductDto) {
    const getData = await this.productRepository.findOneBy({ id });
    if (!getData) {
      throw new NotFoundException('Product not found');
    }
    await this.productRepository.update(id, updateProductDto);
    await this.redis.set(
      id,
      JSON.stringify({ ...getData, ...updateProductDto }),
    );
    return {
      message: 'Product updated',
      productId: getData.id,
    };
  }
  async remove(id: string) {
    const getData = await this.productRepository.findOneBy({ id });
    if (!getData) {
      throw new NotFoundException('Product not found');
    }
    await this.productRepository.delete(id);
    await this.redis.del(id);
    return {
      message: 'Product deleted',
      productId: getData.id,
    };
  }
}

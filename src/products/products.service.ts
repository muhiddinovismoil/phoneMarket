import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Products } from './entities/product.entity';
import { Like, Repository } from 'typeorm';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { PaginationDto } from '../constants/paginationDto/pagination.dto';
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
      const queryOptions: any = {
        skip: offset,
        take: limit,
        where: {},
        relations: ['orderProducts'],
      };

      if (search) {
        queryOptions.where.name = Like(`%${search}%`);
      }

      if (filter) {
        const filterConditions = [];
        if (filter.name) {
          filterConditions.push({ name: Like(`%${filter.name}%`) });
        }
        if (filter.price) {
          filterConditions.push({ price: filter.price });
        }
        if (filter.info) {
          filterConditions.push({ info: Like(`%${filter.info}%`) });
        }

        if (filterConditions.length > 0) {
          queryOptions.where = filterConditions;
        }
      }

      const getProducts = await this.productRepository.find(queryOptions);
      if (getProducts.length === 0) {
        throw new NotFoundException('Products not found');
      }

      await this.redis.set(cacheKey, JSON.stringify(getProducts));
      return {
        message: 'All Products',
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

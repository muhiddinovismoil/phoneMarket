import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Products } from './entities/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Products) private productRepository: Repository<Products>,
  ) {}
  async create(createProductDto: CreateProductDto) {
    const newProduct = await this.productRepository.create({
      ...createProductDto,
    });
    await this.productRepository.save(newProduct);
    return {
      message: 'Product successfully added',
      productId: newProduct.id,
    };
  }

  async findAll() {
    const getProducts = await this.productRepository.find();
    if (getProducts.length === 0) {
      throw new NotFoundException('Products not found');
    }
    return {
      message: 'All Prodcuts',
      products: getProducts,
    };
  }

  async findOne(id: string) {
    const getProduct = await this.productRepository.findOneBy({ id });
    if (getProduct) {
      throw new NotFoundException('Product not found');
    }
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
    return {
      message: 'Product deleted',
      productId: getData.id,
    };
  }
}

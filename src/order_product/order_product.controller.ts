import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { OrderProductService } from './order_product.service';
import { CreateOrderProductDto } from './dto/create-order_product.dto';
import { UpdateOrderProductDto } from './dto/update-order_product.dto';
import { PaginationDto } from 'src/constants/paginationDto/pagination.dto';

@Controller('order-product')
export class OrderProductController {
  constructor(private readonly orderProductService: OrderProductService) {}

  @Post()
  create(@Body() createOrderProductDto: CreateOrderProductDto) {
    return this.orderProductService.create(createOrderProductDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.orderProductService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderProductService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrderProductDto: UpdateOrderProductDto,
  ) {
    return this.orderProductService.update(id, updateOrderProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderProductService.remove(id);
  }
}

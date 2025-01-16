import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrderProductService } from './order_product.service';
import { CreateOrderProductDto } from './dto/create-order_product.dto';
import { UpdateOrderProductDto } from './dto/update-order_product.dto';
import { PaginationDto } from 'src/constants/paginationDto/pagination.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@Controller('order-product')
export class OrderProductController {
  constructor(private readonly orderProductService: OrderProductService) {}
  // =====================
  // CREATE ORDER PRODUCT
  @ApiOperation({ summary: 'Create Order Product' })
  @ApiBody({ type: CreateOrderProductDto })
  @ApiCreatedResponse({ description: 'Order Product Created' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized token expired or not valid',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createOrderProductDto: CreateOrderProductDto) {
    return this.orderProductService.create(createOrderProductDto);
  }
  // =====================
  // GET ALL ORDER PRODUCT
  // =====================
  @ApiOperation({ summary: 'Get All Order Product' })
  @ApiQuery({ name: 'page', required: false })
  @ApiOkResponse({ description: 'Order Product Found' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized token expired or not valid',
  })
  @ApiNotFoundResponse({ description: 'Order Product Not Found' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.orderProductService.findAll(paginationDto);
  }
  // =====================
  // GET ONE ORDER PRODUCT
  // =====================
  @ApiOperation({ summary: 'Get One Order Product' })
  @ApiParam({ name: 'id', description: 'Order Product Id' })
  @ApiNotFoundResponse({ description: 'Order Product Not Found' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized token expired or not valid',
  })
  @ApiOkResponse({ description: 'Order Product Found' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderProductService.findOne(id);
  }
  // =====================
  // UPDATE ORDER PRODUCT
  // =====================
  @ApiOperation({ summary: 'Update Order Product' })
  @ApiParam({ name: 'id', description: 'Order Product Id' })
  @ApiOkResponse({ description: 'Order Product Updated' })
  @ApiNotFoundResponse({ description: 'Order Product Not Found' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized token expired or not valid',
  })
  @ApiBody({ type: CreateOrderProductDto })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrderProductDto: UpdateOrderProductDto,
  ) {
    return this.orderProductService.update(id, updateOrderProductDto);
  }
  // =====================
  // DELETE ORDER PRODUCT
  // =====================
  @ApiOperation({ summary: 'Delete Order Product' })
  @ApiParam({ name: 'id', description: 'Order Product Id' })
  @ApiNotFoundResponse({ description: 'Order Product Not Found' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized token expired or not valid',
  })
  @ApiOkResponse({ description: 'Order Product Deleted' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderProductService.remove(id);
  }
}

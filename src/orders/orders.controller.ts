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
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PaginationDto } from 'src/constants/paginationDto/pagination.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/constants/decorator/role.decorator';
import { Role } from 'src/constants/enums/roles';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}
  // =======================
  // CREATE ORDER
  @ApiOperation({ summary: 'Create order' })
  @ApiBody({ type: CreateOrderDto })
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'The order has been successfully created.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized token expired or not valid',
  })
  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    return await this.ordersService.create(createOrderDto);
  }
  // =======================
  // GET ALL ORDERS
  // =======================
  @ApiOperation({ summary: 'Get all orders' })
  @ApiNotFoundResponse({ description: 'No orders found' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized token expired or not valid',
  })
  @ApiOkResponse({ description: 'Orders found' })
  @ApiQuery({ name: 'page', required: false })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.ordersService.findAll(paginationDto);
  }
  // =======================
  // GET ORDER BY ID
  // =======================
  @ApiOperation({ summary: 'Get order by id' })
  @ApiParam({ name: 'id', required: true })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: 'Unauthorized token expired or not valid',
  })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ApiOkResponse({ description: 'Order found' })
  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.ordersService.findOne(id);
  }
  // =======================
  // UPDATE ORDER BY ID
  // =======================
  @ApiOperation({ summary: 'Update order by id' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', required: true })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized token expired or not valid',
  })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ApiOkResponse({ description: 'Order updated' })
  @UseGuards(AuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return await this.ordersService.update(id, updateOrderDto);
  }
  // =======================
  // DELETE ORDER BY ID
  // =======================
  @ApiOkResponse({ description: 'Order deleted' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', required: true })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized token expired or not valid',
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiOperation({ summary: 'Delete order by id' })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.admin)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.ordersService.remove(id);
  }
}

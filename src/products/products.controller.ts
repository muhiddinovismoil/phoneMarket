import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../constants/paginationDto/pagination.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { Roles } from 'src/constants/decorator/role.decorator';
import { RoleGuard } from 'src/guards/role.guard';
import { Role } from 'src/constants/enums/roles';
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

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  // ================================
  // CREATE PRODUCT ENDPOINT
  @ApiOperation({ summary: 'Create product' })
  @ApiBody({ type: CreateProductDto, description: 'CREATE PRODUCTS' })
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'The product has been successfully created.',
  })
  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productsService.create(createProductDto);
  }
  // ================================
  // GET ALL PRODUCTS ENDPOINT
  // ================================
  @ApiOperation({ summary: 'Get all products' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', description: 'GET PRODUCTS' })
  @ApiOkResponse({ description: 'List of products' })
  @ApiNotFoundResponse({ description: 'No products found' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized token not valid or expired',
  })
  @UseGuards(AuthGuard)
  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.productsService.findAll(paginationDto);
  }
  // ================================
  // GET ONE PRODUCT ENDPOINT
  // ================================
  @ApiOperation({ summary: 'Get one' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Product found' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized token not valid or expired',
  })
  @ApiParam({ name: 'id', description: 'GET PRODUCTS' })
  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.productsService.findOne(id);
  }
  // ================================
  // UPDATE PRODUCT ENDPOINT
  // ================================
  @ApiOperation({ summary: 'Update product' })
  @ApiBearerAuth()
  @ApiBody({ type: CreateProductDto, description: 'UPDATE PRODUCTS OPTIONAL' })
  @ApiOkResponse({ description: 'Product updated' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized token not valid or expired',
  })
  @ApiParam({ name: 'id', description: 'UPDATE PRODUCTS' })
  @ApiForbiddenResponse({ description: 'Forbidden you have no access to do' })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.admin)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return await this.productsService.update(id, updateProductDto);
  }
  // ================================
  // DELETE PRODUCT ENDPOINT
  // ================================
  @ApiOperation({ summary: 'Delete product' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'DELETE PRODUCTS' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiOkResponse({ description: 'Product deleted' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized token not valid or expired',
  })
  @ApiForbiddenResponse({ description: 'Forbidden you have no access to do' })
  @UseGuards(AuthGuard)
  @Roles(Role.admin)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.productsService.remove(id);
  }
}

import { Module } from '@nestjs/common';
import { OrderProductService } from './order_product.service';
import { OrderProductController } from './order_product.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [OrderProductController],
  providers: [OrderProductService, PrismaService],
})
export class OrderProductModule {}

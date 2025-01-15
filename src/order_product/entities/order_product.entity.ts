import { Entity, Column, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Orders } from '../../orders/entities/order.entity';
import { Products } from '../../products/entities/product.entity';

@Entity()
export class OrderProducts {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ example: '98adsf18234adgj123' })
  id: string;
  @Column({ type: 'uuid' })
  @ApiProperty({ example: '135asjfhdljaksweqwe' })
  order_id: string;
  @Column({ type: 'uuid' })
  @ApiProperty({ example: '51uias123youiasdf' })
  product_id: string;
  @OneToMany(() => Products, (product) => product.orderProducts)
  products: Products[];
  @OneToMany(() => Orders, (order) => order.orderProducts)
  orders: Orders[];
}

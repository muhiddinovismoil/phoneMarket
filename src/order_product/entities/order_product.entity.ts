import { Entity, Column, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Orders } from '../../orders/entities/order.entity';
import { Products } from '../../products/entities/product.entity';

@Entity()
export class OrderProducts {
  @Column()
  @ApiProperty({ example: '135asjfhdljaksweqwe' })
  order_id: string;
  @Column()
  @ApiProperty({ example: '51uias123youiasdf' })
  product_id: string;
  @OneToMany(() => Products, (product) => product.orderProducts)
  products: Products[];
  @OneToMany(() => Orders, (order) => order.orderProducts)
  orders: Orders[];
}

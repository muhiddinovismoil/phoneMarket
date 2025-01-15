import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { OrderProducts } from '../../order_product/entities/order_product.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Products {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ example: '123asdfhasjlkq3412jh' })
  id: string;
  @Column({ type: 'varchar', length: 75 })
  @ApiProperty({ example: 'IPhone X' })
  name: string;
  @Column({ type: 'decimal' })
  @ApiProperty({ example: 299.99 })
  price: number;
  @Column({ type: 'text' })
  @ApiProperty({ example: '256/4 GB Apple Bionic A15 LL/A' })
  info: string;
  @Column({ type: 'boolean', default: true })
  @ApiProperty({ example: true })
  is_active: boolean;
  @Column({ type: 'integer' })
  @ApiProperty({ example: 4 })
  quantity: number;
  @ManyToOne(() => OrderProducts, (orderProducts) => orderProducts.products)
  orderProducts: OrderProducts[];
}

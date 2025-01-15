import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../../constants/enums/orderstatus';
import { OrderProducts } from '../../order_product/entities/order_product.entity';
import { Users } from '../../users/entities/user.entity';

@Entity()
export class Orders {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ example: '61asfkjsfkajalkdfjkasl' })
  id: string;
  @Column({ type: 'uuid' })
  @ApiProperty({ example: '61asfkjsfk123f1234asdf' })
  user_id: string;
  @Column({ type: 'decimal' })
  @ApiProperty({ example: 621.84 })
  total_price: number;
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.pending })
  @ApiProperty({ example: OrderStatus.pending })
  status: OrderStatus;
  @OneToMany(() => Users, (user) => user.orders)
  users: Users[];
  @ManyToOne(() => OrderProducts, (orderProducts) => orderProducts.orders)
  orderProducts: OrderProducts[];
}

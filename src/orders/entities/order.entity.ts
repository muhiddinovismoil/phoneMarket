import { OrderStatus } from 'src/constants/enums/orderstatus';
import { OrderProducts } from 'src/order_product/entities/order_product.entity';
import { Users } from 'src/users/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';

@Entity()
export class Orders {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  user_id: string;
  @Column()
  total_price: number;
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.pending })
  status: OrderStatus;
  @OneToMany(() => Users, (user) => user.orders)
  users: Users[];
  @ManyToOne(() => OrderProducts, (orderProducts) => orderProducts.orders)
  orderProducts: OrderProducts[];
}

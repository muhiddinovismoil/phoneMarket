import { OrderProducts } from 'src/order_product/entities/order_product.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity()
export class Products {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ length: 75 })
  name: string;
  @Column()
  price: number;
  @Column()
  info: string;
  @Column({ default: false })
  is_active: boolean;
  @Column()
  quantity: number;
  @ManyToOne(() => OrderProducts, (orderProducts) => orderProducts.products)
  orderProducts: OrderProducts[];
}

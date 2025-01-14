import { Orders } from 'src/orders/entities/order.entity';
import { Products } from 'src/products/entities/product.entity';
import { Entity, Column, OneToMany } from 'typeorm';

@Entity()
export class OrderProducts {
  @Column()
  order_id: string;
  @Column()
  product_id: string;
  @OneToMany(() => Products, (product) => product.orderProducts)
  products: Products[];
  @OneToMany(() => Orders, (order) => order.orderProducts)
  orders: Orders[];
}

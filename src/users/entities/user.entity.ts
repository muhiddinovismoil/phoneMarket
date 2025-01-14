import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Role } from '../../constants/enums/roles';
import { Orders } from 'src/orders/entities/order.entity';

@Entity()
export class Users {
  @PrimaryGeneratedColumn('identity')
  id: string;
  @Column({ length: 50 })
  fullname: string;
  @Column({ length: 50, unique: true })
  email: string;
  @Column({ length: 50, unique: true })
  phone: string;
  @Column({ length: 50 })
  password: string;
  @Column({ type: 'enum', enum: Role, default: Role.user })
  role: Role;
  @Column({ default: false })
  isActive: boolean;
  @Column()
  refresh_token: string;
  @ManyToOne(() => Orders, (order) => order.users)
  orders: Orders[];
}

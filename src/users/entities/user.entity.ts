import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../constants/enums/roles';
import { Orders } from '../../orders/entities/order.entity';
import { OTP } from '../../auth/entities/otp.entity';

@Entity()
export class Users {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ example: '5asy6132bkjasd8f' })
  id: string;
  @Column({ type: 'varchar', length: 100 })
  @ApiProperty({ example: 'John Doe' })
  fullname: string;
  @Column({ type: 'varchar', length: 100, unique: true })
  @ApiProperty({ example: 'exampleemail@gmail.com' })
  email: string;
  @Column({ type: 'varchar', length: 100, unique: true })
  @ApiProperty({ example: '+988990000000' })
  phone_number: string;
  @Column({ type: 'varchar', length: 150 })
  @ApiProperty({ example: 'qwerty12345' })
  password: string;
  @Column({ type: 'enum', enum: Role, default: Role.user })
  @ApiProperty({ example: Role.user })
  role: Role;
  @Column({ type: 'boolean', default: false })
  @ApiProperty({ example: false })
  isActive: boolean;
  @Column({ type: 'text', nullable: true })
  @ApiProperty({
    example:
      'eyJhbGciOiJIzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NzdjMzg3YjI5YWMwZWI1Yjg1OGRiZDMiLCJlbWFpbCI6Im11aGlkZGlub3Zpc21vaWwy',
  })
  refresh_token: string;
  @ManyToOne(() => Orders, (order) => order.users)
  orders: Orders[];
  @OneToMany(() => OTP, (otp) => otp.users)
  otps: OTP[];
}

import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Users } from '../../users/entities/user.entity';
@Entity()
export class OTP {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ example: '5asy6132bkjasd8f' })
  id: string;
  @Column({ type: 'uuid' })
  @ApiProperty({ example: '5af123agca412qe1' })
  user_id: string;
  @Column({ type: 'varchar', length: 50 })
  @ApiProperty({ example: 'g4DA2ad' })
  otp_code: string;
  @Column({ default: new Date(Date.now() + 2 * 60 * 1000) })
  @ApiProperty({ example: '12 Apr, 2025' })
  expires: Date;
  @ManyToOne(() => Users, (user) => user.otps)
  users: Users[];
}

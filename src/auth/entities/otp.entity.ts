import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
@Entity()
export class OTP {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ example: '5asy6132bkjasd8f' })
  id: string;
  @Column()
  @ApiProperty({ example: '5af123agca412qe1' })
  user_id: string;
  @Column()
  @ApiProperty({ example: 'g4DA2ad' })
  otp_code: string;
  @ApiProperty({ example: '12 Apr, 2025' })
  @Column({ default: new Date(Date.now() + 2 * 60 * 1000) })
  expires: Date;
}

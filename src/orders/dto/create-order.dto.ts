import { IsEnum, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from 'src/constants/enums/orderstatus';
export class CreateOrderDto {
  @IsString()
  @ApiProperty({ example: '61asfkjsfk123f1234asdf' })
  user_id: string;
  @IsNumber()
  @ApiProperty({ example: 621.84 })
  total_price: number;
  @IsEnum(OrderStatus)
  @ApiProperty({ example: OrderStatus.pending })
  status: OrderStatus;
}

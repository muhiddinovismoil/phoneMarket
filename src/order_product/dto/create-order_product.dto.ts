import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateOrderProductDto {
  @IsString()
  @ApiProperty({ example: '135asjfhdljaksweqwe' })
  order_id: string;
  @IsString()
  @ApiProperty({ example: '51uias123youiasdf' })
  product_id: string;
}

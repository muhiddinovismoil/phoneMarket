import { Transform } from 'class-transformer';
import {
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { OrderStatus } from '../enums/orderstatus';

export class PaginationDto {
  @IsOptional()
  @IsPositive()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  readonly page?: number;

  @IsOptional()
  @IsPositive()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  readonly limit?: number;
  @IsOptional()
  @IsString()
  readonly search?: string;

  @IsOptional()
  @IsObject()
  readonly filter?: {
    name?: string;
    price?: number;
    info?: string;
    total_price?: number;
    status: OrderStatus;
  };
}

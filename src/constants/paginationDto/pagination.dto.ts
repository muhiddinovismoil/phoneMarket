import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive } from 'class-validator';

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
}

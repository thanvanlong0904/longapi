/* eslint-disable @typescript-eslint/no-unsafe-call */
import 'reflect-metadata';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString({ message: 'Tên sản phẩm phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  name: string;

  @IsString({ message: 'Mô tả phải là chuỗi' })
  @IsOptional()
  description?: string;

  @IsNumber({}, { message: 'Giá sản phẩm phải là số' })
  @Min(0, { message: 'Giá sản phẩm phải >= 0' })
  price: number;

  @IsNumber({}, { message: 'Giá cũ phải là số' })
  @Min(0, { message: 'Giá cũ phải >= 0' })
  oldprice: number;

  @IsString({ message: 'Danh mục phải là chuỗi' })
  @IsNotEmpty({ message: 'Danh mục không được để trống' })
  category: string;

  @IsNumber({}, { message: 'Số lượng phải là số' })
  @Min(0, { message: 'Số lượng phải >= 0' })
  qty: number;
}

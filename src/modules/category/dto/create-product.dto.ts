import { IsBoolean, IsString, IsNotEmpty } from 'class-validator';

export class CreateCategoryDto {
  @IsString({ message: 'Tên danh mục phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên danh mục không được để trống' })
  name: string;

  @IsString({ message: 'Mô tả danh mục phải là chuỗi' })
  @IsNotEmpty({ message: 'Mô tả danh mục không được để trống' })
  des: string;

  @IsString({ message: 'Slug danh mục phải là chuỗi' })
  @IsNotEmpty({ message: 'Slug danh mục không được để trống' })
  slug: string;

  @IsBoolean({ message: 'Trạng thái danh mục phải là boolean' })
  status: boolean;
}

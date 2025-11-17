import { Injectable } from '@nestjs/common';
import { Product, ProductDocument } from './product.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateProductDto } from './dto/create-product.dto';
@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(product: CreateProductDto): Promise<Product> {
    const newProduct = new this.productModel(product);
    return newProduct.save();
  }

  async findAll(search?: string, sortBy?: string): Promise<Product[]> {
    const query: any = {};

    // Nếu có search term, tìm kiếm trong name (case-insensitive)
    if (search && search.trim()) {
      query.name = { $regex: search.trim(), $options: 'i' };
    }

    // Sắp xếp
    let sort: any = {};
    if (sortBy === 'price-asc') {
      sort = { price: 1 }; // Tăng dần
    } else if (sortBy === 'price-desc') {
      sort = { price: -1 }; // Giảm dần
    }

    return this.productModel.find(query).sort(sort).exec();
  }

  async findOne(id: string): Promise<Product | null> {
    return this.productModel.findById(id).exec();
  }
}

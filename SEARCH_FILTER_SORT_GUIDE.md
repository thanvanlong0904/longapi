# 🔍 Hướng dẫn Tìm kiếm, Lọc và Sắp xếp (Search, Filter & Sort Guide)

## 🎯 Mục đích (Purpose)

Hướng dẫn chi tiết cách implement tìm kiếm, lọc, sắp xếp trong NestJS với MongoDB.

Detailed guide on how to implement search, filter, and sort in NestJS with MongoDB.

---

## 📋 Mục lục (Table of Contents)

1. [Tổng quan (Overview)](#tổng-quan-overview)
2. [Bước 1: Tìm kiếm cơ bản (Basic Search)](#bước-1-tìm-kiếm-cơ-bản-basic-search)
3. [Bước 2: Lọc theo danh mục (Filter by Category)](#bước-2-lọc-theo-danh-mục-filter-by-category)
4. [Bước 3: Lọc theo giá (Filter by Price)](#bước-3-lọc-theo-giá-filter-by-price)
5. [Bước 4: Sắp xếp (Sorting)](#bước-4-sắp-xếp-sorting)
6. [Bước 5: Kết hợp tất cả (Combine All)](#bước-5-kết-hợp-tất-cả-combine-all)
7. [Ví dụ hoàn chỉnh (Complete Example)](#ví-dụ-hoàn-chỉnh-complete-example)

---

## 📊 Tổng quan (Overview)

### Các tính năng sẽ học (Features to learn):

1. **Tìm kiếm (Search)**
   - Tìm trong name
   - Tìm trong description
   - Case-insensitive search
   - Multi-field search

2. **Lọc (Filter)**
   - Lọc theo category
   - Lọc theo giá (min/max)
   - Lọc theo status
   - Kết hợp nhiều filters

3. **Sắp xếp (Sort)**
   - Sắp xếp theo name
   - Sắp xếp theo price
   - Sắp xếp theo createdAt
   - Ascending/Descending

---

## 📚 Bước 1: Tìm kiếm cơ bản (Basic Search)

### Mục tiêu (Goal)

Tìm kiếm sản phẩm theo tên (name) - không phân biệt hoa thường.

Search products by name - case-insensitive.

### Implementation (Triển khai)

#### 1.1. Tạo DTO cho Query Parameters

**File: `src/modules/product/dto/query-product.dto.ts`**

```typescript
import { IsOptional, IsString } from 'class-validator';

export class QueryProductDto {
  @IsOptional()
  @IsString()
  search?: string; // Tìm kiếm theo tên hoặc mô tả
}
```

#### 1.2. Cập nhật Service

**File: `src/modules/product/product.service.ts`**

**Cách 1: Tách method riêng**

```typescript
async findAll(): Promise<Product[]> {
  return this.productModel.find().exec();
}

async findAllWithSearch(search?: string): Promise<Product[]> {
  const query: any = {};

  if (search) {
    // Tìm kiếm trong name - không phân biệt hoa thường
    query.name = { $regex: search, $options: 'i' }; // 'i' = case-insensitive
  }

  return this.productModel.find(query).exec();
}
```

**Cách 2: Gộp chung vào method `findAll()` (Khuyến nghị)**

```typescript
async findAll(search?: string): Promise<Product[]> {
  const query: any = {};

  if (search) {
    // Tìm kiếm trong name - không phân biệt hoa thường
    query.name = { $regex: search, $options: 'i' }; // 'i' = case-insensitive
  }

  return this.productModel.find(query).exec();
}
```

**Lưu ý:**

- Nếu `search` không có (undefined), `query` sẽ là `{}` → tìm tất cả
- Nếu `search` có giá trị, `query` sẽ có điều kiện tìm kiếm

#### 1.3. Cập nhật Controller

**File: `src/modules/product/product.controller.ts`**

**Cách 1: Service có method riêng `findAllWithSearch()`**

```typescript
import { Query } from '@nestjs/common';

@Get()
async findAll(@Query('search') search?: string) {
  if (search) {
    return this.productService.findAllWithSearch(search);
  }
  return this.productService.findAll();
}
```

**Cách 2: Service có method `findAll(search?: string)` (Gộp chung)**

```typescript
import { Query } from '@nestjs/common';

@Get()
async findAll(@Query('search') search?: string) {
  // Truyền search trực tiếp vào service
  return this.productService.findAll(search);
}
```

**So sánh 2 cách:**

| Cách       | Service Method                       | Controller   | Ưu điểm                      |
| ---------- | ------------------------------------ | ------------ | ---------------------------- |
| **Cách 1** | `findAll()` và `findAllWithSearch()` | Có if/else   | Tách biệt logic rõ ràng      |
| **Cách 2** | `findAll(search?: string)`           | Đơn giản hơn | Code ngắn gọn, ít method hơn |

**Khuyến nghị:** Dùng **Cách 2** (gộp chung) vì đơn giản và dễ maintain hơn.

### Test (Kiểm thử)

```bash
# Tìm kiếm
GET http://localhost:3000/products?search=iphone
GET http://localhost:3000/products?search=IPHONE
GET http://localhost:3000/products?search=iPhone
```

### Kết quả (Result)

- ✅ Tìm được "iPhone", "iphone", "IPHONE"
- ✅ Tìm được một phần của từ (ví dụ: "phone" tìm được "iPhone")

---

## 📚 Bước 2: Lọc theo danh mục (Filter by Category)

### Mục tiêu (Goal)

Lọc sản phẩm theo danh mục (category).

Filter products by category.

### Implementation (Triển khai)

#### 2.1. Cập nhật DTO

```typescript
export class QueryProductDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string; // Lọc theo danh mục
}
```

#### 2.2. Cập nhật Service

```typescript
async findAllWithFilters(filters: {
  search?: string;
  category?: string;
}): Promise<Product[]> {
  const query: any = {};

  // Tìm kiếm
  if (filters.search) {
    query.name = { $regex: filters.search, $options: 'i' };
  }

  // Lọc theo category
  if (filters.category) {
    query.category = filters.category; // Tìm chính xác
  }

  return this.productModel.find(query).exec();
}
```

#### 2.3. Cập nhật Controller

```typescript
@Get()
async findAll(@Query() filters: QueryProductDto) {
  return this.productService.findAllWithFilters(filters);
}
```

### Test (Kiểm thử)

```bash
# Lọc theo category
GET http://localhost:3000/products?category=Điện thoại

# Tìm kiếm + lọc category
GET http://localhost:3000/products?search=phone&category=Điện thoại
```

### Kết quả (Result)

- ✅ Lọc được sản phẩm theo category
- ✅ Có thể kết hợp với search

---

## 📚 Bước 3: Lọc theo giá (Filter by Price)

### Mục tiêu (Goal)

Lọc sản phẩm theo khoảng giá (minPrice, maxPrice).

Filter products by price range (minPrice, maxPrice).

### Implementation (Triển khai)

#### 3.1. Cập nhật DTO

```typescript
import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryProductDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Type(() => Number) // Chuyển đổi string thành number
  @IsNumber()
  @Min(0)
  minPrice?: number; // Giá tối thiểu

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number; // Giá tối đa
}
```

#### 3.2. Cập nhật Service

```typescript
async findAllWithFilters(filters: {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}): Promise<Product[]> {
  const query: any = {};

  // Tìm kiếm
  if (filters.search) {
    query.name = { $regex: filters.search, $options: 'i' };
  }

  // Lọc theo category
  if (filters.category) {
    query.category = filters.category;
  }

  // Lọc theo giá (price range)
  if (filters.minPrice || filters.maxPrice) {
    query.price = {};

    if (filters.minPrice) {
      query.price.$gte = filters.minPrice; // >= minPrice (greater than or equal)
    }

    if (filters.maxPrice) {
      query.price.$lte = filters.maxPrice; // <= maxPrice (less than or equal)
    }
  }

  return this.productModel.find(query).exec();
}
```

### Test (Kiểm thử)

```bash
# Lọc theo giá tối thiểu
GET http://localhost:3000/products?minPrice=1000000

# Lọc theo giá tối đa
GET http://localhost:3000/products?maxPrice=5000000

# Lọc theo khoảng giá
GET http://localhost:3000/products?minPrice=1000000&maxPrice=5000000

# Kết hợp tất cả
GET http://localhost:3000/products?search=phone&category=Điện thoại&minPrice=1000000&maxPrice=5000000
```

### Kết quả (Result)

- ✅ Lọc được sản phẩm theo giá
- ✅ Có thể dùng minPrice, maxPrice hoặc cả hai
- ✅ Có thể kết hợp với search và category

---

## 📚 Bước 4: Sắp xếp (Sorting)

### Mục tiêu (Goal)

Sắp xếp sản phẩm theo trường và thứ tự (asc/desc).

Sort products by field and order (asc/desc).

### Implementation (Triển khai)

#### 4.1. Cập nhật DTO

```typescript
export class QueryProductDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt'; // Trường sắp xếp (name, price, createdAt)

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc'; // Thứ tự sắp xếp
}
```

#### 4.2. Cập nhật Service

```typescript
async findAllWithFilters(filters: {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<Product[]> {
  const query: any = {};

  // Tìm kiếm
  if (filters.search) {
    query.name = { $regex: filters.search, $options: 'i' };
  }

  // Lọc theo category
  if (filters.category) {
    query.category = filters.category;
  }

  // Lọc theo giá
  if (filters.minPrice || filters.maxPrice) {
    query.price = {};
    if (filters.minPrice) query.price.$gte = filters.minPrice;
    if (filters.maxPrice) query.price.$lte = filters.maxPrice;
  }

  // Sắp xếp
  const sort: any = {};
  const sortBy = filters.sortBy || 'createdAt';
  const sortOrder = filters.sortOrder || 'desc';
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1; // 1 = asc, -1 = desc

  return this.productModel.find(query).sort(sort).exec();
}
```

### Test (Kiểm thử)

```bash
# Sắp xếp theo giá tăng dần
GET http://localhost:3000/products?sortBy=price&sortOrder=asc

# Sắp xếp theo giá giảm dần
GET http://localhost:3000/products?sortBy=price&sortOrder=desc

# Sắp xếp theo tên
GET http://localhost:3000/products?sortBy=name&sortOrder=asc

# Kết hợp tất cả
GET http://localhost:3000/products?search=phone&category=Điện thoại&minPrice=1000000&maxPrice=5000000&sortBy=price&sortOrder=asc
```

### Kết quả (Result)

- ✅ Sắp xếp được theo nhiều trường
- ✅ Có thể chọn asc hoặc desc
- ✅ Có thể kết hợp với search và filters

---

## 📚 Bước 5: Kết hợp tất cả (Combine All)

### Mục tiêu (Goal)

Kết hợp tìm kiếm, lọc và sắp xếp trong một API.

Combine search, filter, and sort in one API.

### Implementation (Triển khai)

#### 5.1. DTO hoàn chỉnh

**File: `src/modules/product/dto/query-product.dto.ts`**

```typescript
import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryProductDto {
  // Tìm kiếm
  @IsOptional()
  @IsString()
  search?: string;

  // Lọc
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minQty?: number; // Số lượng tối thiểu

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxQty?: number; // Số lượng tối đa

  @IsOptional()
  @IsString()
  status?: string; // Trạng thái (nếu có)

  // Sắp xếp
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt'; // name, price, createdAt, qty

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
```

#### 5.2. Service hoàn chỉnh

**File: `src/modules/product/product.service.ts`**

```typescript
async findAllWithFilters(filters: QueryProductDto): Promise<Product[]> {
  const query: any = {};

  // ========== TÌM KIẾM (SEARCH) ==========
  if (filters.search) {
    // Tìm kiếm trong name và description
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
    ];
  }

  // ========== LỌC (FILTER) ==========

  // Lọc theo category
  if (filters.category) {
    query.category = filters.category;
  }

  // Lọc theo giá (price range)
  if (filters.minPrice || filters.maxPrice) {
    query.price = {};
    if (filters.minPrice) {
      query.price.$gte = filters.minPrice; // >= minPrice
    }
    if (filters.maxPrice) {
      query.price.$lte = filters.maxPrice; // <= maxPrice
    }
  }

  // Lọc theo số lượng (quantity range)
  if (filters.minQty || filters.maxQty) {
    query.qty = {};
    if (filters.minQty) {
      query.qty.$gte = filters.minQty; // >= minQty
    }
    if (filters.maxQty) {
      query.qty.$lte = filters.maxQty; // <= maxQty
    }
  }

  // Lọc theo status
  if (filters.status !== undefined) {
    // Nếu status là string "true" hoặc "false", chuyển thành boolean
    if (filters.status === 'true') {
      query.status = true;
    } else if (filters.status === 'false') {
      query.status = false;
    } else {
      query.status = filters.status;
    }
  }

  // ========== SẮP XẾP (SORT) ==========
  const sort: any = {};
  const sortBy = filters.sortBy || 'createdAt';
  const sortOrder = filters.sortOrder || 'desc';
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Thực thi query
  return this.productModel.find(query).sort(sort).exec();
}
```

#### 5.3. Controller hoàn chỉnh

**File: `src/modules/product/product.controller.ts`**

```typescript
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { Product } from './product.schema';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() data: CreateProductDto): Promise<Product> {
    return this.productService.create(data);
  }

  @Get()
  async findAll(@Query() filters: QueryProductDto): Promise<Product[]> {
    // Kiểm tra xem có filters không
    const hasFilters =
      filters.search ||
      filters.category ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.minQty ||
      filters.maxQty ||
      filters.status ||
      filters.sortBy !== 'createdAt' ||
      filters.sortOrder !== 'desc';

    if (hasFilters) {
      return this.productService.findAllWithFilters(filters);
    }

    // Nếu không có filters, trả về tất cả
    return this.productService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Product | null> {
    return this.productService.findOne(id);
  }
}
```

---

## 🎯 Ví dụ hoàn chỉnh (Complete Example)

### File hoàn chỉnh: Service

**File: `src/modules/product/product.service.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { Product, ProductDocument } from './product.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductDto } from './dto/query-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  // Tạo sản phẩm mới
  async create(product: CreateProductDto): Promise<Product> {
    const newProduct = new this.productModel(product);
    return newProduct.save();
  }

  // Lấy tất cả sản phẩm (không filter)
  async findAll(): Promise<Product[]> {
    return this.productModel.find().exec();
  }

  // Lấy sản phẩm với filters (tìm kiếm, lọc, sắp xếp)
  async findAllWithFilters(filters: QueryProductDto): Promise<Product[]> {
    const query: any = {};

    // ========== TÌM KIẾM (SEARCH) ==========
    if (filters.search) {
      // Tìm kiếm trong name và description - không phân biệt hoa thường
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ];
    }

    // ========== LỌC (FILTER) ==========

    // Lọc theo category
    if (filters.category) {
      query.category = filters.category;
    }

    // Lọc theo giá (price range)
    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) {
        query.price.$gte = filters.minPrice; // >= minPrice
      }
      if (filters.maxPrice) {
        query.price.$lte = filters.maxPrice; // <= maxPrice
      }
    }

    // Lọc theo số lượng (quantity range)
    if (filters.minQty || filters.maxQty) {
      query.qty = {};
      if (filters.minQty) {
        query.qty.$gte = filters.minQty;
      }
      if (filters.maxQty) {
        query.qty.$lte = filters.maxQty;
      }
    }

    // Lọc theo status (nếu có)
    if (filters.status !== undefined) {
      if (filters.status === 'true') {
        query.status = true;
      } else if (filters.status === 'false') {
        query.status = false;
      }
    }

    // ========== SẮP XẾP (SORT) ==========
    const sort: any = {};
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Thực thi query với sort
    return this.productModel.find(query).sort(sort).exec();
  }

  // Lấy sản phẩm theo ID
  async findOne(id: string): Promise<Product | null> {
    return this.productModel.findById(id).exec();
  }
}
```

### File hoàn chỉnh: DTO

**File: `src/modules/product/dto/query-product.dto.ts`**

```typescript
import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryProductDto {
  // ========== TÌM KIẾM (SEARCH) ==========
  @IsOptional()
  @IsString()
  search?: string; // Tìm kiếm trong name và description

  // ========== LỌC (FILTER) ==========

  @IsOptional()
  @IsString()
  category?: string; // Lọc theo danh mục

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number; // Giá tối thiểu

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number; // Giá tối đa

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minQty?: number; // Số lượng tối thiểu

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxQty?: number; // Số lượng tối đa

  @IsOptional()
  @IsString()
  status?: string; // Trạng thái (true/false)

  // ========== SẮP XẾP (SORT) ==========

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt'; // Trường sắp xếp: name, price, createdAt, qty

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc'; // Thứ tự: asc (tăng dần) hoặc desc (giảm dần)
}
```

### File hoàn chỉnh: Controller

**File: `src/modules/product/product.controller.ts`**

```typescript
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { Product } from './product.schema';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() data: CreateProductDto): Promise<Product> {
    return this.productService.create(data);
  }

  @Get()
  async findAll(@Query() filters: QueryProductDto): Promise<Product[]> {
    // Kiểm tra có filters không
    const hasFilters =
      filters.search ||
      filters.category ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.minQty ||
      filters.maxQty ||
      filters.status ||
      filters.sortBy !== 'createdAt' ||
      filters.sortOrder !== 'desc';

    if (hasFilters) {
      return this.productService.findAllWithFilters(filters);
    }

    // Không có filters, trả về tất cả
    return this.productService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Product | null> {
    return this.productService.findOne(id);
  }
}
```

---

## 📝 Ví dụ sử dụng API (API Usage Examples)

### 1. Lấy tất cả sản phẩm (Get All Products)

```bash
GET http://localhost:3000/products
```

### 2. Tìm kiếm (Search)

```bash
# Tìm kiếm theo tên
GET http://localhost:3000/products?search=iphone

# Tìm kiếm không phân biệt hoa thường
GET http://localhost:3000/products?search=IPHONE
GET http://localhost:3000/products?search=iPhone
```

### 3. Lọc theo danh mục (Filter by Category)

```bash
# Lọc theo category
GET http://localhost:3000/products?category=Điện thoại

# Tìm kiếm + lọc category
GET http://localhost:3000/products?search=phone&category=Điện thoại
```

### 4. Lọc theo giá (Filter by Price)

```bash
# Giá tối thiểu
GET http://localhost:3000/products?minPrice=1000000

# Giá tối đa
GET http://localhost:3000/products?maxPrice=5000000

# Khoảng giá
GET http://localhost:3000/products?minPrice=1000000&maxPrice=5000000

# Tìm kiếm + lọc giá
GET http://localhost:3000/products?search=phone&minPrice=1000000&maxPrice=5000000
```

### 5. Lọc theo số lượng (Filter by Quantity)

```bash
# Số lượng tối thiểu
GET http://localhost:3000/products?minQty=10

# Số lượng tối đa
GET http://localhost:3000/products?maxQty=100

# Khoảng số lượng
GET http://localhost:3000/products?minQty=10&maxQty=100
```

### 6. Lọc theo trạng thái (Filter by Status)

```bash
# Chỉ lấy sản phẩm đang hoạt động
GET http://localhost:3000/products?status=true

# Chỉ lấy sản phẩm không hoạt động
GET http://localhost:3000/products?status=false
```

### 7. Sắp xếp (Sort)

```bash
# Sắp xếp theo giá tăng dần
GET http://localhost:3000/products?sortBy=price&sortOrder=asc

# Sắp xếp theo giá giảm dần
GET http://localhost:3000/products?sortBy=price&sortOrder=desc

# Sắp xếp theo tên
GET http://localhost:3000/products?sortBy=name&sortOrder=asc

# Sắp xếp theo số lượng
GET http://localhost:3000/products?sortBy=qty&sortOrder=desc
```

### 8. Kết hợp tất cả (Combine All)

```bash
# Tìm kiếm + Lọc category + Lọc giá + Sắp xếp
GET http://localhost:3000/products?search=phone&category=Điện thoại&minPrice=1000000&maxPrice=5000000&sortBy=price&sortOrder=asc

# Tìm kiếm + Lọc giá + Lọc số lượng + Sắp xếp
GET http://localhost:3000/products?search=iphone&minPrice=2000000&maxPrice=30000000&minQty=5&sortBy=createdAt&sortOrder=desc

# Tất cả filters
GET http://localhost:3000/products?search=phone&category=Điện thoại&minPrice=1000000&maxPrice=5000000&minQty=10&maxQty=100&status=true&sortBy=price&sortOrder=asc
```

---

## 🔧 MongoDB Query Operators (Toán tử truy vấn MongoDB)

### Operators đã sử dụng (Used Operators):

| Operator        | Ý nghĩa                    | Ví dụ                                                              |
| --------------- | -------------------------- | ------------------------------------------------------------------ |
| `$regex`        | Tìm kiếm với regex         | `{ name: { $regex: 'phone', $options: 'i' } }`                     |
| `$options: 'i'` | Case-insensitive           | Không phân biệt hoa/thường                                         |
| `$gte`          | Greater than or equal (>=) | `{ price: { $gte: 1000 } }`                                        |
| `$lte`          | Less than or equal (<=)    | `{ price: { $lte: 5000 } }`                                        |
| `$or`           | OR condition               | `{ $or: [{ name: 'A' }, { name: 'B' }] }`                          |
| `$and`          | AND condition              | `{ $and: [{ price: { $gte: 1000 } }, { price: { $lte: 5000 } }] }` |

### Các operators khác (Other Operators):

| Operator  | Ý nghĩa          | Ví dụ                                |
| --------- | ---------------- | ------------------------------------ |
| `$gt`     | Greater than (>) | `{ price: { $gt: 1000 } }`           |
| `$lt`     | Less than (<)    | `{ price: { $lt: 5000 } }`           |
| `$ne`     | Not equal (!=)   | `{ status: { $ne: false } }`         |
| `$in`     | In array         | `{ category: { $in: ['A', 'B'] } }`  |
| `$nin`    | Not in array     | `{ category: { $nin: ['A', 'B'] } }` |
| `$exists` | Field exists     | `{ description: { $exists: true } }` |

---

## 🎯 Tóm tắt các bước (Summary)

### Bước 1: Tìm kiếm cơ bản

- ✅ Thêm field `search` vào DTO
- ✅ Dùng `$regex` với option `'i'`
- ✅ Tìm trong name

### Bước 2: Lọc theo category

- ✅ Thêm field `category` vào DTO
- ✅ Query: `query.category = filters.category`

### Bước 3: Lọc theo giá

- ✅ Thêm `minPrice`, `maxPrice` vào DTO
- ✅ Dùng `$gte` và `$lte`

### Bước 4: Sắp xếp

- ✅ Thêm `sortBy`, `sortOrder` vào DTO
- ✅ Dùng `.sort()` với object

### Bước 5: Kết hợp tất cả

- ✅ Tìm kiếm trong nhiều trường
- ✅ Kết hợp nhiều filters
- ✅ Sắp xếp kết quả

---

## 💡 Tips & Best Practices (Mẹo & Thực hành tốt nhất)

### 1. Validation (Xác thực)

- ✅ Luôn validate input với class-validator
- ✅ Dùng `@Type()` để chuyển đổi string thành number
- ✅ Set `@Min(0)` cho giá và số lượng

### 2. Performance (Hiệu suất)

- ✅ Tạo index cho các trường thường filter: `category`, `price`
- ✅ Tạo index cho các trường thường sort: `price`, `createdAt`
- ✅ Giới hạn số lượng kết quả trả về

### 3. Error Handling (Xử lý lỗi)

```typescript
try {
  return await this.productModel.find(query).sort(sort).exec();
} catch (error) {
  throw new BadRequestException('Invalid query parameters');
}
```

### 4. Default Values (Giá trị mặc định)

- ✅ Set default cho `sortBy` và `sortOrder`
- ✅ Kiểm tra null/undefined trước khi dùng

---

## 📚 Tài liệu tham khảo (References)

- [MongoDB Query Operators](https://www.mongodb.com/docs/manual/reference/operator/query/)
- [MongoDB $regex](https://www.mongodb.com/docs/manual/reference/operator/query/regex/)
- [NestJS Query Parameters](https://docs.nestjs.com/controllers#query-parameters)

---

**Chúc bạn học tốt! 🎉**

**Good luck with your learning! 🚀**

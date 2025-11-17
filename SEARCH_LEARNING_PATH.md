# 🔍 Lộ trình học Tìm kiếm (Search Learning Path)

## 🎯 Mục đích (Purpose)

Lộ trình học tìm kiếm từ cơ bản đến nâng cao trong NestJS với MongoDB.

Learning path for search functionality from basic to advanced in NestJS with MongoDB.

---

## 📋 Mục lục (Table of Contents)

1. [Bước 1: Tìm kiếm cơ bản (Basic Search)](#bước-1-tìm-kiếm-cơ-bản-basic-search)
2. [Bước 2: Tìm kiếm nhiều trường (Multi-field Search)](#bước-2-tìm-kiếm-nhiều-trường-multi-field-search)
3. [Bước 3: Tìm kiếm không phân biệt hoa thường (Case-insensitive)](#bước-3-tìm-kiếm-không-phân-biệt-hoa-thường-case-insensitive)
4. [Bước 4: Tìm kiếm kết hợp với Filter (Search + Filter)](#bước-4-tìm-kiếm-kết-hợp-với-filter-search--filter)
5. [Bước 5: Tìm kiếm nâng cao (Advanced Search)](#bước-5-tìm-kiếm-nâng-cao-advanced-search)
6. [Bước 6: Full-text Search (Tìm kiếm toàn văn)](#bước-6-full-text-search-tìm-kiếm-toàn-văn)

---

## 📚 Bước 1: Tìm kiếm cơ bản (Basic Search)

### Mục tiêu (Goal)

Tìm kiếm sản phẩm theo tên (name) - tìm chính xác.

Search products by name - exact match.

### Học gì? (What to learn?)

- Query parameter trong NestJS
- MongoDB `find()` với điều kiện đơn giản
- DTO cho query parameters

### Implementation (Triển khai)

#### 1.1. Cập nhật DTO

**File: `src/modules/product/dto/query-product.dto.ts`**

```typescript
import { IsOptional, IsString } from 'class-validator';

export class QueryProductDto {
  @IsOptional()
  @IsString()
  search?: string; // Thêm field search
}
```

#### 1.2. Cập nhật Service

**File: `src/modules/product/product.service.ts`**

```typescript
async findAllWithSearch(search?: string): Promise<Product[]> {
  const query: any = {};

  // Nếu có search, tìm theo name
  if (search) {
    query.name = search; // Tìm chính xác
  }

  return this.productModel.find(query).exec();
}
```

#### 1.3. Cập nhật Controller

**File: `src/modules/product/product.controller.ts`**

```typescript
@Get()
async findAll(@Query('search') search?: string) {
  return this.productService.findAllWithSearch(search);
}
```

### Test (Kiểm thử)

```bash
# Tìm chính xác
GET http://localhost:3000/products?search=iPhone
```

### Kết quả (Result)

- ✅ Tìm được sản phẩm có tên chính xác là "iPhone"
- ❌ Không tìm được "iphone" (khác chữ hoa/thường)
- ❌ Không tìm được "iPhone 15" (chỉ tìm chính xác)

---

## 📚 Bước 2: Tìm kiếm nhiều trường (Multi-field Search)

### Mục tiêu (Goal)

Tìm kiếm trong nhiều trường cùng lúc (name, description).

Search across multiple fields at once (name, description).

### Học gì? (What to learn?)

- MongoDB `$or` operator
- Tìm kiếm trong nhiều fields

### Implementation (Triển khai)

#### 2.1. Cập nhật Service

```typescript
async findAllWithSearch(search?: string): Promise<Product[]> {
  const query: any = {};

  if (search) {
    // Tìm trong nhiều trường
    query.$or = [
      { name: search },
      { description: search },
    ];
  }

  return this.productModel.find(query).exec();
}
```

### Test (Kiểm thử)

```bash
# Tìm trong name hoặc description
GET http://localhost:3000/products?search=smartphone
```

### Kết quả (Result)

- ✅ Tìm được nếu "smartphone" có trong name HOẶC description
- ❌ Vẫn tìm chính xác (case-sensitive)

---

## 📚 Bước 3: Tìm kiếm không phân biệt hoa thường (Case-insensitive)

### Mục tiêu (Goal)

Tìm kiếm không phân biệt chữ hoa/thường.

Case-insensitive search.

### Học gì? (What to learn?)

- MongoDB `$regex` operator
- Regex options: `'i'` (case-insensitive)

### Implementation (Triển khai)

#### 3.1. Cập nhật Service

```typescript
async findAllWithSearch(search?: string): Promise<Product[]> {
  const query: any = {};

  if (search) {
    // Tìm không phân biệt hoa thường
    query.$or = [
      { name: { $regex: search, $options: 'i' } }, // 'i' = case-insensitive
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  return this.productModel.find(query).exec();
}
```

### Test (Kiểm thử)

```bash
# Tìm không phân biệt hoa thường
GET http://localhost:3000/products?search=iphone
GET http://localhost:3000/products?search=IPHONE
GET http://localhost:3000/products?search=iPhone
```

### Kết quả (Result)

- ✅ Tìm được "iPhone", "iphone", "IPHONE"
- ✅ Tìm được một phần của từ (ví dụ: "phone" tìm được "iPhone")

---

## 📚 Bước 4: Tìm kiếm kết hợp với Filter (Search + Filter)

### Mục tiêu (Goal)

Tìm kiếm kết hợp với các bộ lọc (category, price range).

Combine search with filters (category, price range).

### Học gì? (What to learn?)

- Kết hợp nhiều điều kiện trong MongoDB query
- `$and`, `$or` operators
- Range queries với `$gte`, `$lte`

### Implementation (Triển khai)

#### 4.1. Cập nhật DTO

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
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;
}
```

#### 4.2. Cập nhật Service

```typescript
async findAllWithFilters(filters: {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}): Promise<Product[]> {
  const query: any = {};

  // Tìm kiếm (search)
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
    ];
  }

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

  return this.productModel.find(query).exec();
}
```

#### 4.3. Cập nhật Controller

```typescript
@Get()
async findAll(@Query() filters: QueryProductDto) {
  return this.productService.findAllWithFilters(filters);
}
```

### Test (Kiểm thử)

```bash
# Tìm kiếm + lọc category
GET http://localhost:3000/products?search=phone&category=Điện thoại

# Tìm kiếm + lọc giá
GET http://localhost:3000/products?search=phone&minPrice=1000000&maxPrice=5000000

# Kết hợp tất cả
GET http://localhost:3000/products?search=phone&category=Điện thoại&minPrice=1000000&maxPrice=5000000
```

### Kết quả (Result)

- ✅ Tìm kiếm kết hợp với filters
- ✅ Có thể dùng riêng search hoặc filters
- ✅ Có thể kết hợp tất cả

---

## 📚 Bước 5: Tìm kiếm nâng cao (Advanced Search)

### Mục tiêu (Goal)

Tìm kiếm với nhiều tính năng: partial match, multiple keywords, sorting.

Advanced search with partial match, multiple keywords, sorting.

### Học gì? (What to learn?)

- Tách từ khóa thành nhiều từ
- Tìm kiếm với `$in` operator
- Sắp xếp kết quả theo relevance

### Implementation (Triển khai)

#### 5.1. Tìm kiếm với nhiều từ khóa

```typescript
async findAllWithAdvancedSearch(search?: string): Promise<Product[]> {
  const query: any = {};

  if (search) {
    // Tách search thành nhiều từ
    const keywords = search.trim().split(/\s+/); // Tách theo khoảng trắng

    // Tìm các từ trong name hoặc description
    query.$or = keywords.map((keyword) => ({
      $or: [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
      ],
    }));
  }

  return this.productModel.find(query).exec();
}
```

#### 5.2. Tìm kiếm với sorting theo relevance

```typescript
async findAllWithRelevance(search?: string): Promise<Product[]> {
  const query: any = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  // Sắp xếp: name match trước, sau đó description match
  const products = await this.productModel.find(query).exec();

  // Sort by relevance (name match > description match)
  return products.sort((a, b) => {
    const aNameMatch = a.name.toLowerCase().includes(search.toLowerCase());
    const bNameMatch = b.name.toLowerCase().includes(search.toLowerCase());

    if (aNameMatch && !bNameMatch) return -1;
    if (!aNameMatch && bNameMatch) return 1;
    return 0;
  });
}
```

### Test (Kiểm thử)

```bash
# Tìm với nhiều từ
GET http://localhost:3000/products?search=iPhone 15 Pro
```

---

## 📚 Bước 6: Full-text Search (Tìm kiếm toàn văn)

### Mục tiêu (Goal)

Tìm kiếm toàn văn với MongoDB Text Index (nhanh và mạnh hơn).

Full-text search with MongoDB Text Index (faster and more powerful).

### Học gì? (What to learn?)

- MongoDB Text Index
- `$text` operator
- Text search scoring

### Implementation (Triển khai)

#### 6.1. Tạo Text Index trong Schema

**File: `src/modules/product/product.schema.ts`**

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  // ... other fields
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Tạo Text Index cho tìm kiếm
ProductSchema.index({ name: 'text', description: 'text' });
```

#### 6.2. Service với Text Search

```typescript
async findAllWithTextSearch(search?: string): Promise<Product[]> {
  const query: any = {};

  if (search) {
    // Sử dụng $text search (cần có text index)
    query.$text = { $search: search };
  }

  // Sắp xếp theo text score (relevance)
  return this.productModel
    .find(query, { score: { $meta: 'textScore' } }) // Thêm score
    .sort({ score: { $meta: 'textScore' } }) // Sort by relevance
    .exec();
}
```

### Lưu ý (Note)

- Text Index chỉ tạo được 1 lần (hoặc cần drop và tạo lại)
- Có thể tạo index thủ công trong MongoDB hoặc dùng migration

---

## 🎯 Tóm tắt các bước (Summary)

| Bước | Tính năng          | Độ khó           | Thời gian học |
| ---- | ------------------ | ---------------- | ------------- |
| 1    | Tìm kiếm chính xác | ⭐ Dễ            | 30 phút       |
| 2    | Tìm nhiều trường   | ⭐ Dễ            | 30 phút       |
| 3    | Case-insensitive   | ⭐⭐ Trung bình  | 1 giờ         |
| 4    | Search + Filter    | ⭐⭐ Trung bình  | 1-2 giờ       |
| 5    | Advanced Search    | ⭐⭐⭐ Khó       | 2-3 giờ       |
| 6    | Full-text Search   | ⭐⭐⭐⭐ Rất khó | 3-4 giờ       |

---

## 📝 Checklist học tập (Learning Checklist)

### Bước 1: Basic Search

- [ ] Hiểu query parameters trong NestJS
- [ ] Implement tìm kiếm chính xác
- [ ] Test với Postman/Thunder Client

### Bước 2: Multi-field Search

- [ ] Hiểu `$or` operator
- [ ] Implement tìm nhiều trường
- [ ] Test tìm trong name và description

### Bước 3: Case-insensitive

- [ ] Hiểu `$regex` và options
- [ ] Implement case-insensitive search
- [ ] Test với các chữ hoa/thường khác nhau

### Bước 4: Search + Filter

- [ ] Hiểu kết hợp nhiều điều kiện
- [ ] Implement search + category filter
- [ ] Implement search + price range
- [ ] Test kết hợp tất cả

### Bước 5: Advanced Search

- [ ] Hiểu tách từ khóa
- [ ] Implement multi-keyword search
- [ ] Implement relevance sorting
- [ ] Test với nhiều từ khóa

### Bước 6: Full-text Search

- [ ] Hiểu Text Index
- [ ] Tạo Text Index trong schema
- [ ] Implement `$text` search
- [ ] Test performance

---

## 🚀 Bắt đầu học (Getting Started)

### Tuần 1: Bước 1-3 (Cơ bản)

**Ngày 1-2:** Bước 1 - Tìm kiếm cơ bản

- Học query parameters
- Implement exact search
- Test và debug

**Ngày 3-4:** Bước 2 - Tìm nhiều trường

- Học `$or` operator
- Implement multi-field search
- Test

**Ngày 5-7:** Bước 3 - Case-insensitive

- Học `$regex`
- Implement case-insensitive
- Test với nhiều trường hợp

### Tuần 2: Bước 4-5 (Nâng cao)

**Ngày 1-3:** Bước 4 - Search + Filter

- Học kết hợp điều kiện
- Implement filters
- Test kết hợp

**Ngày 4-7:** Bước 5 - Advanced Search

- Học multi-keyword
- Implement relevance
- Test và optimize

### Tuần 3: Bước 6 (Chuyên sâu)

**Ngày 1-7:** Bước 6 - Full-text Search

- Học Text Index
- Setup index
- Implement và test performance

---

## 💡 Tips học tập (Learning Tips)

### 1. Học từng bước một

- ✅ Hoàn thành bước 1 trước khi sang bước 2
- ✅ Test kỹ từng bước
- ✅ Hiểu rõ cách hoạt động

### 2. Thực hành nhiều

- ✅ Tạo nhiều test cases
- ✅ Test với dữ liệu thực tế
- ✅ Debug khi có lỗi

### 3. Đọc tài liệu

- ✅ MongoDB query operators
- ✅ NestJS query parameters
- ✅ Regex patterns

### 4. So sánh kết quả

- ✅ So sánh các cách tìm kiếm
- ✅ Đo performance
- ✅ Chọn cách tốt nhất

---

## 📚 Tài liệu tham khảo (References)

### MongoDB

- [MongoDB Query Operators](https://www.mongodb.com/docs/manual/reference/operator/query/)
- [MongoDB $regex](https://www.mongodb.com/docs/manual/reference/operator/query/regex/)
- [MongoDB Text Index](https://www.mongodb.com/docs/manual/core/indexes/index-types/index-text/)

### NestJS

- [NestJS Query Parameters](https://docs.nestjs.com/controllers#query-parameters)
- [NestJS Validation](https://docs.nestjs.com/techniques/validation)

---

## 🎯 Bài tập thực hành (Practice Exercises)

### Bài 1: Basic Search

Tạo API tìm kiếm sản phẩm theo tên chính xác.

### Bài 2: Multi-field Search

Tìm kiếm trong name và description cùng lúc.

### Bài 3: Case-insensitive Search

Tìm kiếm không phân biệt hoa thường.

### Bài 4: Search + Filter

Tìm kiếm kết hợp với lọc category và giá.

### Bài 5: Advanced Search

Tìm kiếm với nhiều từ khóa và sắp xếp theo relevance.

### Bài 6: Full-text Search

Implement full-text search với Text Index.

---

**Chúc bạn học tốt! 🎉**

**Good luck with your learning! 🚀**

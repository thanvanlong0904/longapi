# 📝 Hướng dẫn DTO và Validation (DTO & Validation Guide)

## 🎯 Câu hỏi: Có cần validation trong DTO không?

### Trả lời ngắn gọn (Short Answer):

**CÓ, nhưng tùy trường hợp!**

- ✅ **CẦN validation** cho: Create, Update (POST, PUT, PATCH)
- ⚠️ **TÙY CHỌN validation** cho: Query parameters (GET)

---

## 🤔 Tại sao cần validation? (Why validation?)

### 1. Bảo vệ Database (Protect Database)

**Không có validation:**

```typescript
// User gửi: { price: "abc" } hoặc { price: -1000 }
// → Database lưu sai dữ liệu hoặc crash
```

**Có validation:**

```typescript
// User gửi: { price: "abc" }
// → API trả về lỗi 400 Bad Request ngay lập tức
// → Database không bị ảnh hưởng
```

### 2. Trải nghiệm người dùng tốt hơn (Better UX)

**Không có validation:**

```typescript
// User gửi: { name: "" } (rỗng)
// → API chấp nhận, nhưng không tìm được gì
// → User không biết tại sao
```

**Có validation:**

```typescript
// User gửi: { name: "" }
// → API trả về: "Name không được để trống"
// → User biết lỗi và sửa ngay
```

### 3. Bảo mật (Security)

**Không có validation:**

```typescript
// Hacker gửi: { name: { $ne: null } } (MongoDB injection)
// → Có thể hack database
```

**Có validation:**

```typescript
// Hacker gửi: { name: { $ne: null } }
// → Validation chặn, chỉ chấp nhận string
// → An toàn hơn
```

---

## 📋 Các Decorator hay dùng trong DTO (Common DTO Decorators)

### 1. Validation Decorators (Từ `class-validator`)

#### `@IsString()` - Kiểm tra là chuỗi

```typescript
import { IsString } from 'class-validator';

export class CreateProductDto {
  @IsString({ message: 'Tên phải là chuỗi' })
  name: string;
}
```

**Khi nào dùng:**

- ✅ Bắt buộc cho Create/Update DTO
- ⚠️ Tùy chọn cho Query DTO (nếu sai thì không tìm được thôi)

**Ví dụ:**

```typescript
// ✅ Đúng
{
  name: 'iPhone';
}

// ❌ Sai - API trả về lỗi
{
  name: 123;
}
{
  name: null;
}
```

---

#### `@IsNotEmpty()` - Không được để trống

```typescript
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên không được để trống' })
  name: string;
}
```

**Khi nào dùng:**

- ✅ **Bắt buộc** cho Create/Update DTO (required fields)
- ❌ **Không cần** cho Query DTO (optional fields)

**Ví dụ:**

```typescript
// ✅ Đúng
{
  name: 'iPhone';
}

// ❌ Sai - API trả về lỗi
{
  name: '';
}
{
  name: '   ';
} // Chỉ có khoảng trắng
```

---

#### `@IsOptional()` - Tùy chọn (có thể có hoặc không)

```typescript
import { IsOptional, IsString } from 'class-validator';

export class QueryProductDto {
  @IsOptional()
  @IsString()
  search?: string; // Có thể có hoặc không
}
```

**Khi nào dùng:**

- ✅ **Luôn dùng** cho Query DTO (tất cả fields đều optional)
- ✅ **Dùng** cho Update DTO (chỉ update fields được gửi)

**Ví dụ:**

```typescript
// ✅ Tất cả đều đúng
{
  search: 'iphone';
}
{
  search: '';
}
{
} // Không có search cũng OK
```

---

#### `@IsNumber()` - Kiểm tra là số

```typescript
import { IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @Type(() => Number) // Chuyển string thành number
  @IsNumber({}, { message: 'Giá phải là số' })
  @Min(0, { message: 'Giá phải >= 0' })
  price: number;
}
```

**Khi nào dùng:**

- ✅ **Bắt buộc** cho Create/Update DTO
- ⚠️ **Tùy chọn** cho Query DTO (nếu sai thì không filter được)

**Lưu ý quan trọng:**

- Phải dùng `@Type(() => Number)` vì query params luôn là string
- Không có `@Type()` → validation sẽ fail

**Ví dụ:**

```typescript
// Query params (GET)
?price=1000  // → string "1000"
// Cần @Type(() => Number) để chuyển thành number 1000

// Body (POST)
{ price: 1000 }  // → number 1000
// Không cần @Type()
```

---

#### `@Min()` và `@Max()` - Giá trị tối thiểu/tối đa

```typescript
import { IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Giá phải >= 0' })
  @Max(100000000, { message: 'Giá phải <= 100,000,000' })
  price: number;
}

export class QueryProductDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number; // Phải >= 0
}
```

**Khi nào dùng:**

- ✅ **Bắt buộc** cho Create/Update DTO (giá, số lượng, v.v.)
- ✅ **Nên dùng** cho Query DTO (tránh giá trị âm)

**Ví dụ:**

```typescript
// ✅ Đúng
{
  price: 1000;
}
{
  minPrice: 0;
}

// ❌ Sai - API trả về lỗi
{
  price: -100;
}
{
  minPrice: -50;
}
```

---

#### `@IsBoolean()` - Kiểm tra là boolean

```typescript
import { IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean({ message: 'Status phải là true hoặc false' })
  status: boolean;
}
```

**Khi nào dùng:**

- ✅ **Bắt buộc** cho Create/Update DTO
- ⚠️ **Tùy chọn** cho Query DTO

**Lưu ý:**

- Query params luôn là string: `?status=true` → string "true"
- Cần `@Transform()` để chuyển "true"/"false" thành boolean

---

#### `@IsEmail()` - Kiểm tra email

```typescript
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty()
  email: string;
}
```

**Khi nào dùng:**

- ✅ **Bắt buộc** cho Create/Update DTO có email

---

#### `@IsEnum()` - Kiểm tra enum

```typescript
import { IsEnum } from 'class-validator';

enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
}

export class CreateProductDto {
  @IsEnum(ProductStatus, { message: 'Status không hợp lệ' })
  status: ProductStatus;
}
```

**Khi nào dùng:**

- ✅ **Bắt buộc** khi có enum values

---

### 2. Transformation Decorators (Từ `class-transformer`)

#### `@Type()` - Chuyển đổi kiểu dữ liệu

```typescript
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class QueryProductDto {
  @IsOptional()
  @Type(() => Number) // Chuyển string → number
  @IsNumber()
  page?: number;
}
```

**Khi nào dùng:**

- ✅ **Bắt buộc** cho Query DTO với number/boolean
- ❌ **Không cần** cho Body DTO (POST/PUT)

**Ví dụ:**

```typescript
// Query params (GET)
?page=1  // → string "1"
// Cần @Type(() => Number) → number 1

// Body (POST)
{ page: 1 }  // → number 1
// Không cần @Type()
```

---

#### `@Transform()` - Chuyển đổi tùy chỉnh

```typescript
import { Transform } from 'class-transformer';
import { IsBoolean } from 'class-validator';

export class QueryProductDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  status?: boolean;
}
```

**Khi nào dùng:**

- ✅ Khi cần logic chuyển đổi phức tạp
- ✅ Chuyển string "true"/"false" thành boolean

---

## 📊 So sánh: Có validation vs Không validation

### Scenario 1: Create Product (POST)

#### ❌ Không có validation:

```typescript
// DTO
export class CreateProductDto {
  name: string;
  price: number;
}

// User gửi
POST /products
{
  "name": "",           // Rỗng
  "price": "abc"        // Không phải số
}

// Kết quả:
// → Database lưu sai dữ liệu
// → Hoặc crash với lỗi khó hiểu
// → User không biết lỗi gì
```

#### ✅ Có validation:

```typescript
// DTO
export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên không được để trống' })
  name: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'Giá phải là số' })
  @Min(0, { message: 'Giá phải >= 0' })
  price: number;
}

// User gửi
POST /products
{
  "name": "",
  "price": "abc"
}

// Kết quả:
// → API trả về 400 Bad Request
// → Message rõ ràng: "Tên không được để trống", "Giá phải là số"
// → User biết lỗi và sửa ngay
```

---

### Scenario 2: Query Products (GET)

#### ❌ Không có validation:

```typescript
// DTO
export class QueryProductDto {
  search?: string;
  minPrice?: number;
}

// User gửi
GET /products?search=iphone&minPrice=abc

// Kết quả:
// → minPrice = "abc" (string)
// → Query: { price: { $gte: "abc" } }
// → Không tìm được gì (nhưng không báo lỗi)
// → User không biết tại sao
```

#### ⚠️ Có validation (tùy chọn):

```typescript
// DTO
export class QueryProductDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;
}

// User gửi
GET /products?search=iphone&minPrice=abc

// Kết quả:
// → API trả về 400 Bad Request
// → Message: "minPrice phải là số"
// → User biết lỗi và sửa
```

#### ✅ Không có validation (cũng OK):

```typescript
// DTO
export class QueryProductDto {
  search?: string;
  minPrice?: number; // Không có validation
}

// User gửi
GET /products?search=iphone&minPrice=abc

// Kết quả:
// → minPrice = "abc" (string)
// → Query không match
// → Trả về [] (mảng rỗng)
// → User tự hiểu là không có kết quả
```

**Kết luận cho Query DTO:**

- ⚠️ **Có validation**: Tốt hơn, user biết lỗi ngay
- ✅ **Không có validation**: Cũng OK, chỉ không tìm được thôi

---

## 🎯 Quy tắc vàng (Golden Rules)

### 1. Create/Update DTO (POST, PUT, PATCH)

**✅ LUÔN CẦN validation:**

```typescript
export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @IsBoolean()
  status: boolean;
}
```

**Lý do:**

- Bảo vệ database
- Tránh lưu dữ liệu sai
- User biết lỗi ngay

---

### 2. Query DTO (GET)

**⚠️ TÙY CHỌN validation:**

#### Option 1: Có validation (Khuyến nghị)

```typescript
export class QueryProductDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;
}
```

**Ưu điểm:**

- User biết lỗi ngay
- API rõ ràng hơn
- Tránh confusion

**Nhược điểm:**

- Code nhiều hơn
- Phải handle validation errors

---

#### Option 2: Không có validation (Cũng OK)

```typescript
export class QueryProductDto {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
}
```

**Ưu điểm:**

- Code đơn giản
- Nhanh hơn
- Nếu sai thì không tìm được thôi

**Nhược điểm:**

- User không biết lỗi
- Có thể bị MongoDB injection (nếu không cẩn thận)

---

## 📝 Ví dụ thực tế (Real Examples)

### Example 1: Create Product DTO (Có validation)

```typescript
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString({ message: 'Tên phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên không được để trống' })
  name: string;

  @IsString({ message: 'Mô tả phải là chuỗi' })
  @IsOptional() // Mô tả có thể để trống
  description?: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'Giá phải là số' })
  @Min(0, { message: 'Giá phải >= 0' })
  price: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'Số lượng phải là số' })
  @Min(0, { message: 'Số lượng phải >= 0' })
  qty: number;

  @IsString({ message: 'Danh mục phải là chuỗi' })
  @IsNotEmpty({ message: 'Danh mục không được để trống' })
  category: string;

  @IsBoolean({ message: 'Trạng thái phải là true hoặc false' })
  status: boolean;
}
```

---

### Example 2: Query Product DTO (Có validation - Khuyến nghị)

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

  // Sắp xếp
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
```

---

### Example 3: Query Product DTO (Không có validation - Cũng OK)

```typescript
export class QueryProductDto {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

**Trong Service, cần xử lý type conversion:**

```typescript
async findAllWithFilters(filters: QueryProductDto) {
  const query: any = {};

  if (filters.search) {
    query.name = { $regex: filters.search, $options: 'i' };
  }

  if (filters.minPrice) {
    const minPrice = Number(filters.minPrice);
    if (!isNaN(minPrice)) {
      query.price = { $gte: minPrice };
    }
  }

  // ...
}
```

---

## 🎯 Tóm tắt (Summary)

### Khi nào CẦN validation:

| Loại DTO                   | Validation      | Lý do                             |
| -------------------------- | --------------- | --------------------------------- |
| **Create DTO** (POST)      | ✅ **Bắt buộc** | Bảo vệ database, tránh lưu sai    |
| **Update DTO** (PUT/PATCH) | ✅ **Bắt buộc** | Bảo vệ database, tránh update sai |
| **Query DTO** (GET)        | ⚠️ **Tùy chọn** | Nếu sai thì không tìm được thôi   |

### Các decorator hay dùng:

| Decorator             | Khi nào dùng           | Ví dụ                       |
| --------------------- | ---------------------- | --------------------------- |
| `@IsString()`         | Validate string        | name, description           |
| `@IsNotEmpty()`       | Không được rỗng        | Required fields             |
| `@IsOptional()`       | Tùy chọn               | Query params, Update fields |
| `@IsNumber()`         | Validate number        | price, qty                  |
| `@Min()` / `@Max()`   | Giá trị min/max        | price >= 0                  |
| `@Type(() => Number)` | Chuyển string → number | Query params                |
| `@IsBoolean()`        | Validate boolean       | status                      |
| `@IsEmail()`          | Validate email         | email                       |
| `@IsEnum()`           | Validate enum          | status enum                 |

---

## 💡 Kết luận (Conclusion)

### Cho Create/Update DTO:

**✅ LUÔN dùng validation** - Bắt buộc!

### Cho Query DTO:

**⚠️ TÙY CHỌN:**

- **Có validation**: Tốt hơn, user biết lỗi ngay
- **Không có validation**: Cũng OK, code đơn giản hơn

**Khuyến nghị:** Dùng validation cho Query DTO để có trải nghiệm tốt hơn!

---

**Happy Coding! 🎉**

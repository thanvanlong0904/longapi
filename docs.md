# 📚 Tài liệu hướng dẫn dự án LongAPI (NestJS)

## 🎯 Giới thiệu (Introduction)

LongAPI là dự án REST API được xây dựng với NestJS, TypeScript, MongoDB và Mongoose.

LongAPI is a REST API project built with NestJS, TypeScript, MongoDB, and Mongoose.

## 🚀 Bắt đầu (Getting Started)

### Yêu cầu hệ thống (System Requirements)

- Node.js >= 18.x
- MongoDB (đang chạy trên localhost:27017)
- npm hoặc yarn

### Cài đặt (Installation)

```bash
# Cài đặt dependencies (Install dependencies)
npm install

# Hoặc sử dụng yarn (Or use yarn)
yarn install
```

### Chạy dự án (Running the Project)

```bash
# Development mode (Chế độ phát triển)
npm run start:dev

# Build production (Build cho production)
npm run build

# Start production server (Khởi động server production)
npm run start:prod

# Lint code (Kiểm tra lỗi code)
npm run lint
```

Dự án sẽ chạy tại: `http://localhost:3000`

The project will run at: `http://localhost:3000`

## 📁 Cấu trúc thư mục (Directory Structure)

```
longapi/
├── src/
│   ├── app.module.ts           # Root module (Module gốc)
│   ├── app.controller.ts       # Root controller (Controller gốc)
│   ├── app.service.ts          # Root service (Service gốc)
│   ├── main.ts                 # Entry point (Điểm vào)
│   │
│   ├── modules/                # Tất cả các modules (All modules)
│   │   ├── product/            # Product module (Module sản phẩm)
│   │   │   ├── product.module.ts
│   │   │   ├── product.controller.ts
│   │   │   ├── product.service.ts
│   │   │   ├── product.schema.ts
│   │   │   └── dto/
│   │   │       └── create-product.dto.ts
│   │   │
│   │   ├── category/           # Category module (Module danh mục)
│   │   │   ├── category.module.ts
│   │   │   ├── category.controller.ts
│   │   │   ├── category.service.ts
│   │   │   ├── category.schema.ts
│   │   │   └── dto/
│   │   │       └── create-product.dto.ts
│   │   │
│   │   └── auth/               # Auth module (Module xác thực) - nếu có
│   │       ├── auth.module.ts
│   │       ├── auth.controller.ts
│   │       ├── auth.service.ts
│   │       ├── dto/
│   │       └── strategies/
│   │
│   ├── common/                 # Common/shared functionality (Chức năng dùng chung)
│   │   ├── guards/             # Authentication/Authorization guards (Bảo vệ xác thực)
│   │   ├── interceptors/       # Interceptors (Bộ chặn)
│   │   ├── filters/            # Exception filters (Bộ lọc ngoại lệ)
│   │   ├── decorators/         # Custom decorators (Decorator tùy chỉnh)
│   │   ├── pipes/              # Custom pipes (Pipe tùy chỉnh)
│   │   ├── interfaces/         # Common interfaces (Giao diện chung)
│   │   └── constants/          # Common constants (Hằng số chung)
│   │
│   ├── config/                 # Configuration files (File cấu hình)
│   │
│   ├── database/               # Database configuration (Cấu hình database)
│   │
│   ├── shared/                 # Shared resources (Tài nguyên dùng chung)
│   │   ├── types/              # Shared types (Kiểu dữ liệu chung)
│   │   ├── interfaces/         # Shared interfaces (Giao diện chung)
│   │   └── enums/              # Shared enums (Enum chung)
│   │
│   └── utils/                  # Utility functions (Hàm tiện ích)
│
├── dist/                       # Compiled files (File đã biên dịch)
├── test/                       # Test files (File test)
├── package.json
└── tsconfig.json
```

## 📖 Hướng dẫn tạo API - Ví dụ Products (Guide to Create API - Products Example)

### Bước 1: Tạo Schema (Create Schema)

Schema định nghĩa cấu trúc dữ liệu trong MongoDB.

Schema defines the data structure in MongoDB.

**File: `src/modules/product/product.schema.ts`**

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

// Định nghĩa type cho document (Define document type)
export type ProductDocument = HydratedDocument<Product>;

// Decorator @Schema để đánh dấu class là Mongoose schema
// @Schema decorator marks the class as a Mongoose schema
@Schema({ timestamps: true }) // timestamps: true tự động thêm createdAt và updatedAt
export class Product {
  // @Prop decorator định nghĩa property trong schema
  // @Prop decorator defines a property in the schema
  @Prop({ required: true }) // required: true = bắt buộc
  name: string;

  @Prop() // Không có required = tùy chọn (Optional)
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  oldprice: number;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  qty: number;
}

// Tạo schema từ class (Create schema from class)
export const ProductSchema = SchemaFactory.createForClass(Product);
```

**Giải thích (Explanation):**
- `@Schema()`: Decorator đánh dấu class là Mongoose schema
- `timestamps: true`: Tự động thêm `createdAt` và `updatedAt`
- `@Prop()`: Decorator định nghĩa property trong schema
- `required: true`: Field bắt buộc phải có
- `SchemaFactory.createForClass()`: Tạo Mongoose schema từ class

---

### Bước 2: Tạo DTO (Create DTO)

DTO (Data Transfer Object) định nghĩa cấu trúc dữ liệu khi nhận từ client, kèm validation.

DTO (Data Transfer Object) defines the data structure when receiving from client, with validation.

**File: `src/modules/product/dto/create-product.dto.ts`**

```typescript
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateProductDto {
  // @IsString: Kiểm tra phải là chuỗi (Check if it's a string)
  // @IsNotEmpty: Kiểm tra không được rỗng (Check if not empty)
  @IsString({ message: 'Tên sản phẩm phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  name: string;

  // @IsOptional: Field này là tùy chọn (This field is optional)
  @IsString({ message: 'Mô tả phải là chuỗi' })
  @IsOptional()
  description?: string;

  // @IsNumber: Kiểm tra phải là số (Check if it's a number)
  // @Min: Giá trị tối thiểu (Minimum value)
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
```

**Các decorator validation phổ biến (Common validation decorators):**
- `@IsString()`: Phải là chuỗi (Must be string)
- `@IsNumber()`: Phải là số (Must be number)
- `@IsNotEmpty()`: Không được rỗng (Must not be empty)
- `@IsOptional()`: Tùy chọn (Optional)
- `@Min(value)`: Giá trị tối thiểu (Minimum value)
- `@Max(value)`: Giá trị tối đa (Maximum value)
- `@IsEmail()`: Phải là email hợp lệ (Must be valid email)
- `@IsBoolean()`: Phải là boolean (Must be boolean)

---

### Bước 3: Tạo Service (Create Service)

Service chứa business logic (logic nghiệp vụ) và tương tác với database.

Service contains business logic and interacts with the database.

**File: `src/modules/product/product.service.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { Product, ProductDocument } from './product.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateProductDto } from './dto/create-product.dto';

// @Injectable: Decorator đánh dấu class có thể được inject (Injectable decorator marks class as injectable)
@Injectable()
export class ProductService {
  // Inject Mongoose model vào constructor (Inject Mongoose model into constructor)
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  // Tạo sản phẩm mới (Create new product)
  async create(product: CreateProductDto): Promise<Product> {
    const newProduct = new this.productModel(product);
    return newProduct.save(); // Lưu vào database (Save to database)
  }

  // Lấy tất cả sản phẩm (Get all products)
  async findAll(): Promise<Product[]> {
    return this.productModel.find().exec(); // .exec() trả về Promise (returns Promise)
  }

  // Lấy sản phẩm theo ID (Get product by ID)
  async findOne(id: string): Promise<Product | null> {
    return this.productModel.findById(id).exec();
  }

  // Cập nhật sản phẩm (Update product) - Ví dụ thêm
  async update(id: string, updateData: Partial<CreateProductDto>): Promise<Product | null> {
    return this.productModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  // Xóa sản phẩm (Delete product) - Ví dụ thêm
  async remove(id: string): Promise<Product | null> {
    return this.productModel.findByIdAndDelete(id).exec();
  }
}
```

**Giải thích (Explanation):**
- `@Injectable()`: Cho phép class được inject vào các class khác
- `@InjectModel()`: Inject Mongoose model vào service
- `this.productModel`: Instance của Mongoose model để thao tác với database
- `.save()`: Lưu document mới vào database
- `.find()`: Tìm tất cả documents
- `.findById()`: Tìm document theo ID
- `.exec()`: Thực thi query và trả về Promise

---

### Bước 4: Tạo Controller (Create Controller)

Controller xử lý HTTP requests và responses, gọi service để thực hiện logic.

Controller handles HTTP requests and responses, calls service to execute logic.

**File: `src/modules/product/product.controller.ts`**

```typescript
import { Body, Controller, Get, Param, Post, Put, Delete } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './product.schema';

// @Controller: Định nghĩa route prefix (Defines route prefix)
@Controller('products') // Tất cả routes sẽ có prefix /products
export class ProductController {
  // Inject service vào controller (Inject service into controller)
  constructor(private readonly productService: ProductService) {}

  // POST /products - Tạo sản phẩm mới (Create new product)
  @Post()
  async create(@Body() data: CreateProductDto): Promise<Product> {
    // @Body(): Lấy dữ liệu từ request body (Get data from request body)
    return this.productService.create(data);
  }

  // GET /products - Lấy tất cả sản phẩm (Get all products)
  @Get()
  async findAll(): Promise<Product[]> {
    return this.productService.findAll();
  }

  // GET /products/:id - Lấy sản phẩm theo ID (Get product by ID)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Product | null> {
    // @Param('id'): Lấy parameter từ URL (Get parameter from URL)
    return this.productService.findOne(id);
  }

  // PUT /products/:id - Cập nhật sản phẩm (Update product) - Ví dụ thêm
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateProductDto>,
  ): Promise<Product | null> {
    return this.productService.update(id, updateData);
  }

  // DELETE /products/:id - Xóa sản phẩm (Delete product) - Ví dụ thêm
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Product | null> {
    return this.productService.remove(id);
  }
}
```

**Các HTTP decorators (HTTP decorators):**
- `@Get()`: GET request
- `@Post()`: POST request
- `@Put()`: PUT request
- `@Patch()`: PATCH request
- `@Delete()`: DELETE request

**Các parameter decorators (Parameter decorators):**
- `@Body()`: Lấy dữ liệu từ request body
- `@Param('name')`: Lấy parameter từ URL route
- `@Query('name')`: Lấy query parameter từ URL
- `@Headers('name')`: Lấy header từ request

---

### Bước 5: Tạo Module (Create Module)

Module kết nối tất cả các phần lại với nhau (controller, service, schema).

Module connects all parts together (controller, service, schema).

**File: `src/modules/product/product.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './product.schema';

// @Module: Decorator định nghĩa module (Decorator defines module)
@Module({
  imports: [
    // Đăng ký Mongoose schema (Register Mongoose schema)
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [ProductController], // Đăng ký controller (Register controller)
  providers: [ProductService], // Đăng ký service (Register service)
  exports: [ProductService], // Export service để module khác có thể dùng (Export service for other modules)
})
export class ProductModule {}
```

**Giải thích (Explanation):**
- `imports`: Import các module khác cần thiết
- `MongooseModule.forFeature()`: Đăng ký Mongoose schema để sử dụng trong module
- `controllers`: Đăng ký các controllers trong module
- `providers`: Đăng ký các services/providers
- `exports`: Export service để module khác có thể sử dụng

---

### Bước 6: Đăng ký Module vào AppModule (Register Module in AppModule)

Đăng ký ProductModule vào AppModule để NestJS nhận biết.

Register ProductModule in AppModule so NestJS recognizes it.

**File: `src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './modules/product/product.module';
import { CategoryModule } from './modules/category/category.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    // Kết nối MongoDB (Connect to MongoDB)
    MongooseModule.forRoot('mongodb://localhost:27017/longapi'),
    // Đăng ký các modules (Register modules)
    ProductModule,
    CategoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

**Giải thích (Explanation):**
- `MongooseModule.forRoot()`: Kết nối đến MongoDB database
- Thêm `ProductModule` vào mảng `imports` để đăng ký module

---

## 🎯 Tóm tắt các bước (Summary of Steps)

1. **Tạo Schema** (`modules/product/product.schema.ts`) - Định nghĩa cấu trúc dữ liệu MongoDB
2. **Tạo DTO** (`modules/product/dto/create-product.dto.ts`) - Định nghĩa và validate dữ liệu đầu vào
3. **Tạo Service** (`modules/product/product.service.ts`) - Viết business logic và tương tác database
4. **Tạo Controller** (`modules/product/product.controller.ts`) - Xử lý HTTP requests/responses
5. **Tạo Module** (`modules/product/product.module.ts`) - Kết nối tất cả các phần lại
6. **Đăng ký Module** (`app.module.ts`) - Đăng ký module vào AppModule với đường dẫn `./modules/product/product.module`

---

## 📝 Ví dụ sử dụng API (API Usage Examples)

### Products API (API Sản phẩm)

#### Tạo sản phẩm mới (Create Product)

```bash
POST http://localhost:3000/products
Content-Type: application/json

{
  "name": "iPhone 15",
  "description": "Điện thoại thông minh",
  "price": 25000000,
  "oldprice": 28000000,
  "category": "Điện thoại",
  "qty": 50
}
```

#### Lấy tất cả sản phẩm (Get All Products)

```bash
GET http://localhost:3000/products
```

#### Lấy sản phẩm theo ID (Get Product by ID)

```bash
GET http://localhost:3000/products/507f1f77bcf86cd799439011
```

#### Cập nhật sản phẩm (Update Product)

```bash
PUT http://localhost:3000/products/507f1f77bcf86cd799439011
Content-Type: application/json

{
  "price": 24000000,
  "qty": 45
}
```

#### Xóa sản phẩm (Delete Product)

```bash
DELETE http://localhost:3000/products/507f1f77bcf86cd799439011
```

### Categories API (API Danh mục)

#### Tạo danh mục mới (Create Category)

```bash
POST http://localhost:3000/categories
Content-Type: application/json

{
  "name": "Điện thoại",
  "des": "Danh mục điện thoại thông minh",
  "slug": "dien-thoai",
  "status": true
}
```

#### Lấy tất cả danh mục (Get All Categories)

```bash
GET http://localhost:3000/categories
```

---

## 🔧 Cấu hình MongoDB (MongoDB Configuration)

### Kết nối MongoDB (Connect to MongoDB)

Trong `app.module.ts`:

```typescript
MongooseModule.forRoot('mongodb://localhost:27017/longapi')
```

**Các format kết nối khác (Other connection formats):**

```typescript
// Với username và password (With username and password)
MongooseModule.forRoot('mongodb://username:password@localhost:27017/longapi')

// Với options (With options)
MongooseModule.forRoot('mongodb://localhost:27017/longapi', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

// Sử dụng environment variable (Use environment variable)
MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/longapi')
```

---

## 📚 Validation với class-validator (Validation with class-validator)

Để validation hoạt động, cần cấu hình trong `main.ts`:

To make validation work, configure in `main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Bật global validation (Enable global validation)
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Loại bỏ properties không có trong DTO (Remove properties not in DTO)
    forbidNonWhitelisted: true, // Từ chối request nếu có properties không hợp lệ (Reject request if invalid properties)
    transform: true, // Tự động transform types (Auto transform types)
  }));

  await app.listen(3000);
}
bootstrap();
```

---

## 🎨 Best Practices (Thực hành tốt nhất)

### 1. Tổ chức code (Code Organization)

- Tất cả modules đặt trong thư mục `modules/`
- Mỗi feature/module trong thư mục riêng: `modules/product/`, `modules/category/`
- Tách DTOs vào thư mục `dto/` trong mỗi module
- Tách schemas, services, controllers vào các file riêng
- Common functionality đặt trong `common/`
- Shared resources đặt trong `shared/`

### 2. Naming Conventions (Quy ước đặt tên)

- **Modules**: `product.module.ts`, `category.module.ts`
- **Controllers**: `product.controller.ts`
- **Services**: `product.service.ts`
- **Schemas**: `product.schema.ts`
- **DTOs**: `create-product.dto.ts`, `update-product.dto.ts`

### 3. Error Handling (Xử lý lỗi)

```typescript
// Trong service (In service)
async findOne(id: string): Promise<Product> {
  const product = await this.productModel.findById(id).exec();
  if (!product) {
    throw new NotFoundException(`Product with ID ${id} not found`);
  }
  return product;
}
```

### 4. Pagination (Phân trang)

```typescript
// Trong service (In service)
async findAll(page: number = 1, limit: number = 10): Promise<Product[]> {
  const skip = (page - 1) * limit;
  return this.productModel.find().skip(skip).limit(limit).exec();
}

// Trong controller (In controller)
@Get()
async findAll(@Query('page') page: string, @Query('limit') limit: string) {
  return this.productService.findAll(+page, +limit);
}
```

---

## 📂 Giải thích các thư mục (Directory Explanations)

### `modules/` - Modules (Các module)

Chứa tất cả các feature modules của ứng dụng. Mỗi module là một feature độc lập.

Contains all feature modules of the application. Each module is an independent feature.

**Ví dụ (Example):**
- `modules/product/` - Module quản lý sản phẩm (Product management module)
- `modules/category/` - Module quản lý danh mục (Category management module)
- `modules/auth/` - Module xác thực (Authentication module)

### `common/` - Common Functionality (Chức năng dùng chung)

Chứa các thành phần được sử dụng chung trong toàn bộ ứng dụng.

Contains components used across the entire application.

- **`guards/`** - Guards cho authentication/authorization
- **`interceptors/`** - Interceptors cho logging, transformation...
- **`filters/`** - Exception filters để xử lý lỗi
- **`decorators/`** - Custom decorators
- **`pipes/`** - Custom pipes
- **`interfaces/`** - Common interfaces
- **`constants/`** - Common constants

### `config/` - Configuration (Cấu hình)

Chứa các file cấu hình cho ứng dụng (database, JWT, environment variables...).

Contains configuration files for the application.

### `database/` - Database (Cơ sở dữ liệu)

Chứa cấu hình database, migrations, seeds (nếu có).

Contains database configuration, migrations, seeds (if any).

### `shared/` - Shared Resources (Tài nguyên dùng chung)

Chứa các tài nguyên được chia sẻ giữa các modules.

Contains resources shared between modules.

- **`types/`** - Shared TypeScript types
- **`interfaces/`** - Shared interfaces
- **`enums/`** - Shared enums

### `utils/` - Utilities (Tiện ích)

Chứa các hàm tiện ích, helpers.

Contains utility functions and helpers.

---

## 🚀 Tài liệu tham khảo (References)

- [NestJS Documentation](https://docs.nestjs.com/) (Tài liệu NestJS)
- [Mongoose Documentation](https://mongoosejs.com/docs/) (Tài liệu Mongoose)
- [class-validator Documentation](https://github.com/typestack/class-validator) (Tài liệu class-validator)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/) (Tài liệu TypeScript)

---

**Happy Coding! 🎉**


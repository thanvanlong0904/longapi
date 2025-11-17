# 📂 Tài liệu giải thích chi tiết các thư mục (Detailed Directory Documentation)

## 🎯 Mục đích (Purpose)

Tài liệu này giải thích chi tiết về cấu trúc thư mục, mục đích và cách sử dụng từng thư mục trong dự án NestJS.

This document explains in detail the directory structure, purpose, and usage of each folder in the NestJS project.

---

## 📁 Cấu trúc tổng quan (Overall Structure)

```
longapi/src/
├── modules/          # Tất cả các feature modules
├── common/           # Chức năng dùng chung
├── config/           # Cấu hình
├── database/         # Cấu hình database
├── shared/           # Tài nguyên dùng chung
├── utils/            # Tiện ích
├── auth/             # Module xác thực (nếu có)
├── app.module.ts     # Root module
├── app.controller.ts # Root controller
├── app.service.ts    # Root service
└── main.ts           # Entry point
```

---

## 📦 1. `modules/` - Feature Modules (Các module tính năng)

### Mục đích (Purpose)

Chứa tất cả các feature modules của ứng dụng. Mỗi module đại diện cho một tính năng hoặc domain cụ thể.

Contains all feature modules of the application. Each module represents a specific feature or domain.

### Cấu trúc (Structure)

```
modules/
├── product/              # Module quản lý sản phẩm
│   ├── product.module.ts
│   ├── product.controller.ts
│   ├── product.service.ts
│   ├── product.schema.ts
│   ├── dto/
│   │   ├── create-product.dto.ts
│   │   └── update-product.dto.ts
│   └── product.controller.spec.ts
│
├── category/             # Module quản lý danh mục
│   ├── category.module.ts
│   ├── category.controller.ts
│   ├── category.service.ts
│   ├── category.schema.ts
│   └── dto/
│
└── auth/                 # Module xác thực (nếu có)
    ├── auth.module.ts
    ├── auth.controller.ts
    ├── auth.service.ts
    ├── dto/
    └── strategies/
```

### Quy tắc (Rules)

- **Mỗi module độc lập**: Mỗi module là một feature hoàn chỉnh và độc lập
- **Tên thư mục**: Sử dụng số ít (singular): `product`, `category`, `user`
- **Cấu trúc chuẩn**: Mỗi module nên có: `module.ts`, `controller.ts`, `service.ts`, `schema.ts`, `dto/`
- **Tách biệt concerns**: Controller xử lý HTTP, Service xử lý logic, Schema định nghĩa data

### Ví dụ sử dụng (Usage Example)

```typescript
// modules/product/product.module.ts
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService], // Export để module khác dùng
})
export class ProductModule {}
```

### Khi nào tạo module mới? (When to create a new module?)

- Khi có một tính năng mới hoàn toàn độc lập
- Khi cần tách biệt domain logic
- Khi muốn tái sử dụng service ở nhiều nơi

---

## 🔧 2. `common/` - Common Functionality (Chức năng dùng chung)

### Mục đích (Purpose)

Chứa các thành phần được sử dụng chung trong toàn bộ ứng dụng, không thuộc về một module cụ thể nào.

Contains components used across the entire application, not specific to any module.

### Cấu trúc (Structure)

```
common/
├── guards/              # Authentication/Authorization guards
│   ├── jwt-auth.guard.ts
│   ├── roles.guard.ts
│   └── api-key.guard.ts
│
├── interceptors/        # Interceptors
│   ├── logging.interceptor.ts
│   ├── transform.interceptor.ts
│   └── timeout.interceptor.ts
│
├── filters/             # Exception filters
│   ├── http-exception.filter.ts
│   ├── all-exceptions.filter.ts
│   └── validation-exception.filter.ts
│
├── decorators/          # Custom decorators
│   ├── roles.decorator.ts
│   ├── current-user.decorator.ts
│   └── public.decorator.ts
│
├── pipes/               # Custom pipes
│   ├── parse-int.pipe.ts
│   ├── validation.pipe.ts
│   └── parse-enum.pipe.ts
│
├── interfaces/          # Common interfaces
│   ├── pagination.interface.ts
│   └── response.interface.ts
│
└── constants/           # Common constants
    ├── messages.ts
    └── status-codes.ts
```

### Chi tiết từng thư mục con (Subdirectory Details)

#### `guards/` - Guards (Bảo vệ)

Guards xác định xem request có được phép tiếp tục hay không.

Guards determine whether a request should be allowed to proceed.

**Ví dụ (Example):**

```typescript
// common/guards/jwt-auth.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    // Kiểm tra JWT token (Check JWT token)
    return this.validateToken(request.headers.authorization);
  }

  private validateToken(token: string): boolean {
    // Logic kiểm tra token (Token validation logic)
    return true;
  }
}
```

**Sử dụng (Usage):**

```typescript
@Controller('products')
@UseGuards(JwtAuthGuard) // Áp dụng guard cho toàn bộ controller
export class ProductController {
  // ...
}
```

#### `interceptors/` - Interceptors (Bộ chặn)

Interceptors có thể chạy logic trước và sau khi method được gọi.

Interceptors can run logic before and after a method is called.

**Ví dụ (Example):**

```typescript
// common/interceptors/logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    return next
      .handle()
      .pipe(tap(() => console.log(`After... ${Date.now() - now}ms`)));
  }
}
```

**Sử dụng (Usage):**

```typescript
@UseInterceptors(LoggingInterceptor)
@Get()
findAll() {
  return this.productService.findAll();
}
```

#### `filters/` - Exception Filters (Bộ lọc ngoại lệ)

Filters xử lý các exception được throw trong ứng dụng.

Filters handle exceptions thrown in the application.

**Ví dụ (Example):**

```typescript
// common/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
    });
  }
}
```

**Sử dụng (Usage):**

```typescript
@UseFilters(HttpExceptionFilter)
@Get(':id')
findOne(@Param('id') id: string) {
  // ...
}
```

#### `decorators/` - Custom Decorators (Decorator tùy chỉnh)

Tạo các decorator tùy chỉnh để sử dụng trong controllers, services.

Create custom decorators for use in controllers, services.

**Ví dụ (Example):**

```typescript
// common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// Sử dụng (Usage)
@Roles('admin', 'user')
@Get()
findAll() {
  // ...
}
```

#### `pipes/` - Custom Pipes (Pipe tùy chỉnh)

Pipes chuyển đổi hoặc validate dữ liệu đầu vào.

Pipes transform or validate input data.

**Ví dụ (Example):**

```typescript
// common/pipes/parse-int.pipe.ts
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException('Validation failed');
    }
    return val;
  }
}
```

#### `interfaces/` - Common Interfaces (Giao diện chung)

Định nghĩa các interface được sử dụng chung.

Define interfaces used across the application.

**Ví dụ (Example):**

```typescript
// common/interfaces/pagination.interface.ts
export interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

#### `constants/` - Common Constants (Hằng số chung)

Định nghĩa các hằng số được sử dụng chung.

Define constants used across the application.

**Ví dụ (Example):**

```typescript
// common/constants/messages.ts
export const MESSAGES = {
  PRODUCT_NOT_FOUND: 'Product not found',
  UNAUTHORIZED: 'Unauthorized access',
  VALIDATION_ERROR: 'Validation failed',
} as const;
```

---

## ⚙️ 3. `config/` - Configuration (Cấu hình)

### Mục đích (Purpose)

Chứa các file cấu hình cho ứng dụng như database, JWT, environment variables.

Contains configuration files for the application such as database, JWT, environment variables.

### Cấu trúc (Structure)

```
config/
├── database.config.ts      # Cấu hình database
├── jwt.config.ts           # Cấu hình JWT
├── app.config.ts           # Cấu hình ứng dụng
└── env.validation.ts       # Validation environment variables
```

### Ví dụ (Example)

```typescript
// config/database.config.ts
export default () => ({
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/longapi',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
});

// config/jwt.config.ts
export default () => ({
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
});
```

### Sử dụng (Usage)

```typescript
// app.module.ts
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig, jwtConfig],
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
```

---

## 🗄️ 4. `database/` - Database Configuration (Cấu hình database)

### Mục đích (Purpose)

Chứa cấu hình database, migrations, seeds (nếu có).

Contains database configuration, migrations, seeds (if any).

### Cấu trúc (Structure)

```
database/
├── migrations/            # Database migrations (nếu dùng)
├── seeds/                 # Database seeds (nếu có)
└── connection.ts          # Database connection config
```

### Ví dụ (Example)

```typescript
// database/connection.ts
import { MongooseModule } from '@nestjs/mongoose';

export const DatabaseModule = MongooseModule.forRoot(
  process.env.MONGODB_URI || 'mongodb://localhost:27017/longapi',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
);
```

---

## 🔄 5. `shared/` - Shared Resources (Tài nguyên dùng chung)

### Mục đích (Purpose)

Chứa các tài nguyên được chia sẻ giữa nhiều modules như types, interfaces, enums.

Contains resources shared between multiple modules such as types, interfaces, enums.

### Cấu trúc (Structure)

```
shared/
├── types/                 # Shared TypeScript types
│   ├── index.ts
│   └── api.types.ts
│
├── interfaces/            # Shared interfaces
│   ├── index.ts
│   └── response.interface.ts
│
└── enums/                 # Shared enums
    ├── index.ts
    └── status.enum.ts
```

### Ví dụ (Example)

```typescript
// shared/types/api.types.ts
export type ID = string | number;

export type Timestamp = {
  createdAt: Date;
  updatedAt: Date;
};

// shared/enums/status.enum.ts
export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
}

// shared/interfaces/response.interface.ts
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
```

### Sử dụng (Usage)

```typescript
// Trong bất kỳ module nào (In any module)
import { ProductStatus } from '@/shared/enums';
import { ApiResponse } from '@/shared/interfaces';
```

---

## 🛠️ 6. `utils/` - Utility Functions (Hàm tiện ích)

### Mục đích (Purpose)

Chứa các hàm tiện ích, helpers được sử dụng trong toàn bộ ứng dụng.

Contains utility functions and helpers used throughout the application.

### Cấu trúc (Structure)

```
utils/
├── format.ts              # Formatting functions
├── validation.ts          # Validation helpers
├── date.ts                # Date utilities
└── string.ts              # String utilities
```

### Ví dụ (Example)

```typescript
// utils/format.ts
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('vi-VN').format(date);
}

// utils/validation.ts
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  return /^[0-9]{10,11}$/.test(phone);
}

// utils/date.ts
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
```

### Sử dụng (Usage)

```typescript
import { formatPrice, formatDate } from '@/utils/format';
import { isValidEmail } from '@/utils/validation';

// Trong service hoặc controller
const formattedPrice = formatPrice(25000000); // "25.000.000 ₫"
const formattedDate = formatDate(new Date());
```

---

## 🔐 7. `auth/` - Authentication Module (Module xác thực)

### Mục đích (Purpose)

Chứa module xác thực và phân quyền (nếu có).

Contains authentication and authorization module (if any).

### Cấu trúc (Structure)

```
auth/
├── auth.module.ts
├── auth.controller.ts
├── auth.service.ts
├── dto/
│   ├── login.dto.ts
│   └── register.dto.ts
└── strategies/
    ├── jwt.strategy.ts
    └── local.strategy.ts
```

### Ví dụ (Example)

```typescript
// auth/dto/login.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

// auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secret',
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }
}
```

---

## 📋 8. Root Files (File gốc)

### `app.module.ts` - Root Module (Module gốc)

Module chính của ứng dụng, import tất cả các modules khác.

Main module of the application, imports all other modules.

```typescript
@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/longapi'),
    ProductModule,
    CategoryModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### `main.ts` - Entry Point (Điểm vào)

File khởi động ứng dụng, cấu hình global pipes, filters, interceptors.

Application bootstrap file, configures global pipes, filters, interceptors.

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(3000);
}
bootstrap();
```

---

## 🎯 Best Practices (Thực hành tốt nhất)

### 1. Tổ chức Modules (Module Organization)

- ✅ Đặt tất cả modules trong `modules/`
- ✅ Mỗi module độc lập và có thể tái sử dụng
- ✅ Export service nếu module khác cần dùng

### 2. Sử dụng Common (Using Common)

- ✅ Đặt guards, interceptors, filters trong `common/`
- ✅ Tạo decorators tùy chỉnh khi cần
- ✅ Sử dụng constants thay vì hardcode

### 3. Configuration (Cấu hình)

- ✅ Sử dụng environment variables
- ✅ Tách cấu hình vào `config/`
- ✅ Validate environment variables khi khởi động

### 4. Shared Resources (Tài nguyên dùng chung)

- ✅ Đặt types, interfaces, enums dùng chung vào `shared/`
- ✅ Export từ `index.ts` để dễ import
- ✅ Tránh duplicate code

### 5. Utilities (Tiện ích)

- ✅ Tạo utility functions khi cần dùng nhiều lần
- ✅ Đặt tên rõ ràng và có mô tả
- ✅ Viết unit tests cho utilities

---

## 📚 Tóm tắt (Summary)

| Thư mục     | Mục đích              | Khi nào sử dụng                           |
| ----------- | --------------------- | ----------------------------------------- |
| `modules/`  | Feature modules       | Tạo module mới cho tính năng              |
| `common/`   | Chức năng dùng chung  | Guards, interceptors, filters, decorators |
| `config/`   | Cấu hình              | Database, JWT, app config                 |
| `database/` | Database config       | Migrations, seeds, connection             |
| `shared/`   | Tài nguyên dùng chung | Types, interfaces, enums                  |
| `utils/`    | Tiện ích              | Helper functions                          |
| `auth/`     | Xác thực              | Authentication module                     |

---

**Happy Coding! 🎉**

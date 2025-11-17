# 🎓 Lộ trình học NestJS (NestJS Learning Path)

## 📋 Mục lục (Table of Contents)

1. [Đã học (Đã biết)](#đã-học-đã-biết)
2. [Bước tiếp theo - Nâng cao CRUD](#bước-tiếp-theo---nâng-cao-crud)
3. [Authentication & Authorization](#authentication--authorization)
4. [Validation & Error Handling](#validation--error-handling)
5. [Testing](#testing)
6. [Advanced Topics](#advanced-topics)
7. [Best Practices](#best-practices)

---

## ✅ Đã học (Đã biết) - Basic CRUD

Bạn đã biết cách:

- ✅ Tạo Schema (Mongoose schema)
- ✅ Tạo DTO với validation
- ✅ Tạo Service (business logic)
- ✅ Tạo Controller (HTTP handlers)
- ✅ Tạo Module
- ✅ CRUD cơ bản: Create, Read, Update, Delete

---

## 🚀 Bước tiếp theo - Nâng cao CRUD

### 1. Pagination (Phân trang)

**Mục đích:** Hiển thị dữ liệu theo trang thay vì tất cả cùng lúc.

**Học:**

- Query parameters (`?page=1&limit=10`)
- Tính toán skip và limit
- Trả về metadata (total, totalPages)

**Ví dụ:**

```typescript
// Service
async findAll(page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    this.productModel.find().skip(skip).limit(limit).exec(),
    this.productModel.countDocuments().exec(),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// Controller
@Get()
findAll(@Query('page') page: string, @Query('limit') limit: string) {
  return this.productService.findAll(+page || 1, +limit || 10);
}
```

### 2. Filtering & Searching (Lọc và tìm kiếm)

**Mục đích:** Tìm kiếm và lọc dữ liệu theo điều kiện.

**Học:**

- Query parameters cho filtering
- MongoDB query operators (`$regex`, `$gte`, `$lte`)
- Tìm kiếm theo nhiều trường

**Ví dụ:**

```typescript
// Service
async findAll(filters: {
  name?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}) {
  const query: any = {};

  if (filters.name) {
    query.name = { $regex: filters.name, $options: 'i' }; // Case-insensitive
  }

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.minPrice || filters.maxPrice) {
    query.price = {};
    if (filters.minPrice) query.price.$gte = filters.minPrice;
    if (filters.maxPrice) query.price.$lte = filters.maxPrice;
  }

  return this.productModel.find(query).exec();
}

// Controller
@Get()
findAll(@Query() filters: FilterProductDto) {
  return this.productService.findAll(filters);
}
```

### 3. Sorting (Sắp xếp)

**Mục đích:** Sắp xếp kết quả theo trường và thứ tự.

**Ví dụ:**

```typescript
// Service
async findAll(sortBy: string = 'createdAt', sortOrder: 'asc' | 'desc' = 'desc') {
  const sort: any = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  return this.productModel.find().sort(sort).exec();
}

// Controller
@Get()
findAll(@Query('sortBy') sortBy: string, @Query('sortOrder') sortOrder: 'asc' | 'desc') {
  return this.productService.findAll(sortBy, sortOrder);
}
```

### 4. Relationships (Quan hệ giữa collections)

**Mục đích:** Kết nối dữ liệu giữa các collections (Product ↔ Category).

**Học:**

- Mongoose `ref` và `populate`
- Virtual properties
- Embedding vs Referencing

**Ví dụ:**

```typescript
// Product Schema
@Schema()
export class Product {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true })
  categoryId: mongoose.Types.ObjectId;

  // ... other fields
}

// Service
async findOne(id: string) {
  return this.productModel.findById(id).populate('categoryId').exec();
}
```

---

## 🔐 Authentication & Authorization

### 1. JWT Authentication (Xác thực JWT)

**Mục đích:** Xác thực người dùng bằng JWT token.

**Học:**

- Passport.js với NestJS
- JWT Strategy
- Login/Register endpoints
- Token generation và validation

**Các bước:**

1. Cài đặt: `npm install @nestjs/passport @nestjs/jwt passport passport-jwt`
2. Tạo User schema
3. Tạo Auth module với JWT strategy
4. Tạo Login/Register endpoints
5. Tạo JWT Guard

### 2. Guards (Bảo vệ routes)

**Mục đích:** Bảo vệ các routes cần authentication.

**Học:**

- `@UseGuards()` decorator
- JWT Auth Guard
- Roles Guard (phân quyền)

**Ví dụ:**

```typescript
@Controller('products')
@UseGuards(JwtAuthGuard) // Bảo vệ toàn bộ controller
export class ProductController {
  @Post()
  @UseGuards(RolesGuard) // Thêm roles guard
  @Roles('admin') // Chỉ admin mới tạo được
  create(@Body() data: CreateProductDto) {
    // ...
  }
}
```

### 3. Password Hashing (Mã hóa mật khẩu)

**Mục đích:** Bảo mật mật khẩu người dùng.

**Học:**

- bcrypt hoặc argon2
- Hash password khi đăng ký
- Compare password khi đăng nhập

**Ví dụ:**

```typescript
import * as bcrypt from 'bcrypt';

// Hash password
const hashedPassword = await bcrypt.hash(password, 10);

// Compare password
const isMatch = await bcrypt.compare(password, hashedPassword);
```

---

## ✅ Validation & Error Handling

### 1. Advanced Validation (Validation nâng cao)

**Học:**

- Custom validators
- Conditional validation
- Array validation
- Nested object validation

**Ví dụ:**

```typescript
import { IsEmail, IsNotEmpty, ValidateIf, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @ValidateIf((o) => o.email) // Chỉ validate nếu có email
  @IsNotEmpty()
  emailVerified?: boolean;
}
```

### 2. Custom Exception Filters (Bộ lọc exception tùy chỉnh)

**Mục đích:** Xử lý lỗi một cách nhất quán.

**Học:**

- Tạo custom exception filter
- Format error response
- Logging errors

**Ví dụ:**

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message:
        exception instanceof HttpException
          ? exception.message
          : 'Internal server error',
    });
  }
}
```

### 3. Custom Validation Pipes (Pipe validation tùy chỉnh)

**Ví dụ:**

```typescript
@Injectable()
export class ParseObjectIdPipe implements PipeTransform {
  transform(value: string) {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new BadRequestException('Invalid ID format');
    }
    return value;
  }
}

// Sử dụng
@Get(':id')
findOne(@Param('id', ParseObjectIdPipe) id: string) {
  // ...
}
```

---

## 🧪 Testing

### 1. Unit Testing (Kiểm thử đơn vị)

**Mục đích:** Test từng function/service riêng lẻ.

**Học:**

- Jest với NestJS
- Mocking dependencies
- Test service methods
- Test controller methods

**Ví dụ:**

```typescript
describe('ProductService', () => {
  let service: ProductService;
  let model: Model<ProductDocument>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getModelToken(Product.name),
          useValue: mockProductModel, // Mock model
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    model = module.get<Model<ProductDocument>>(getModelToken(Product.name));
  });

  it('should create a product', async () => {
    const productData = { name: 'Test', price: 100 };
    const createdProduct = await service.create(productData);
    expect(createdProduct.name).toBe('Test');
  });
});
```

### 2. E2E Testing (Kiểm thử end-to-end)

**Mục đích:** Test toàn bộ flow từ request đến response.

**Học:**

- Supertest
- Test API endpoints
- Test authentication flow

---

## 🚀 Advanced Topics

### 1. Interceptors (Bộ chặn)

**Mục đích:** Thực hiện logic trước/sau khi method được gọi.

**Học:**

- Logging interceptor
- Transform interceptor
- Timeout interceptor
- Response mapping

**Ví dụ:**

```typescript
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
```

### 2. Middleware (Phần mềm trung gian)

**Mục đích:** Xử lý request trước khi đến route handler.

**Học:**

- Logger middleware
- CORS middleware
- Request ID middleware

**Ví dụ:**

```typescript
export function logger(req: Request, res: Response, next: NextFunction) {
  console.log(`Request: ${req.method} ${req.url}`);
  next();
}

// Sử dụng trong main.ts
app.use(logger);
```

### 3. Custom Decorators (Decorator tùy chỉnh)

**Học:**

- Parameter decorators
- Method decorators
- Class decorators

**Ví dụ:**

```typescript
// Lấy current user từ request
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // Được set bởi JWT guard
  },
);

// Sử dụng
@Get('profile')
getProfile(@CurrentUser() user: User) {
  return user;
}
```

### 4. File Upload (Tải file lên)

**Học:**

- Multer với NestJS
- File validation
- Image processing
- Storage (local, S3, Cloudinary)

**Ví dụ:**

```typescript
@Post('upload')
@UseInterceptors(FileInterceptor('file'))
uploadFile(@UploadedFile() file: Express.Multer.File) {
  return {
    filename: file.filename,
    size: file.size,
  };
}
```

### 5. WebSockets (Real-time communication)

**Học:**

- Socket.io với NestJS
- Gateways
- Real-time events

### 6. Caching (Bộ nhớ đệm)

**Học:**

- Redis caching
- Cache interceptor
- Cache manager

**Ví dụ:**

```typescript
@Get()
@UseInterceptors(CacheInterceptor)
@CacheTTL(60) // Cache 60 giây
findAll() {
  return this.productService.findAll();
}
```

### 7. Task Scheduling (Lập lịch tác vụ)

**Học:**

- Cron jobs
- Interval tasks
- Timeout tasks

**Ví dụ:**

```typescript
@Injectable()
export class TasksService {
  @Cron('0 0 * * *') // Chạy mỗi ngày lúc 00:00
  handleCron() {
    console.log('Daily task executed');
  }
}
```

### 8. Queue & Background Jobs (Hàng đợi và công việc nền)

**Học:**

- Bull queue
- Background job processing
- Email sending queue

---

## 📚 Best Practices

### 1. Code Organization (Tổ chức code)

- ✅ Tách logic phức tạp thành nhiều service nhỏ
- ✅ Sử dụng DTOs cho tất cả inputs/outputs
- ✅ Tạo base classes cho common functionality
- ✅ Sử dụng interfaces cho contracts

### 2. Error Handling (Xử lý lỗi)

- ✅ Sử dụng custom exceptions
- ✅ Global exception filter
- ✅ Consistent error response format
- ✅ Logging errors properly

### 3. Security (Bảo mật)

- ✅ Validate tất cả inputs
- ✅ Sanitize user inputs
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Helmet for security headers

### 4. Performance (Hiệu suất)

- ✅ Database indexing
- ✅ Query optimization
- ✅ Caching strategies
- ✅ Lazy loading
- ✅ Pagination

### 5. Documentation (Tài liệu)

- ✅ Swagger/OpenAPI
- ✅ Code comments
- ✅ API documentation
- ✅ README files

---

## 📖 Tài liệu học tập (Learning Resources)

### Official Documentation

- [NestJS Documentation](https://docs.nestjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)

### Video Tutorials

- NestJS Crash Course (YouTube)
- NestJS Full Course (Udemy)

### Practice Projects

1. **Todo API** - CRUD cơ bản
2. **Blog API** - Với authentication
3. **E-commerce API** - Full features
4. **Social Media API** - Advanced features

---

## 🎯 Lộ trình học theo tuần (Weekly Learning Path)

### Tuần 1-2: Nâng cao CRUD

- [ ] Pagination
- [ ] Filtering & Searching
- [ ] Sorting
- [ ] Relationships

### Tuần 3-4: Authentication

- [ ] JWT Authentication
- [ ] Guards
- [ ] Password Hashing
- [ ] User Management

### Tuần 5-6: Validation & Error Handling

- [ ] Advanced Validation
- [ ] Custom Exception Filters
- [ ] Error Logging

### Tuần 7-8: Testing

- [ ] Unit Testing
- [ ] E2E Testing
- [ ] Test Coverage

### Tuần 9-10: Advanced Features

- [ ] Interceptors
- [ ] File Upload
- [ ] Caching
- [ ] Task Scheduling

---

## ✅ Checklist học tập (Learning Checklist)

### Cơ bản (Đã hoàn thành ✅)

- [x] Tạo Schema
- [x] Tạo DTO
- [x] Tạo Service
- [x] Tạo Controller
- [x] Tạo Module
- [x] CRUD cơ bản

### Nâng cao CRUD

- [ ] Pagination
- [ ] Filtering
- [ ] Searching
- [ ] Sorting
- [ ] Relationships

### Authentication

- [ ] JWT Setup
- [ ] Login/Register
- [ ] Guards
- [ ] Password Hashing

### Validation & Errors

- [ ] Custom Validators
- [ ] Exception Filters
- [ ] Error Handling

### Testing

- [ ] Unit Tests
- [ ] E2E Tests

### Advanced

- [ ] Interceptors
- [ ] File Upload
- [ ] Caching
- [ ] WebSockets
- [ ] Task Scheduling

---

**Chúc bạn học tốt! 🎉**

**Good luck with your learning! 🚀**

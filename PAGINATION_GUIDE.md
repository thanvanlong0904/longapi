# 📄 Hướng dẫn Phân trang (Pagination Guide)

## 🎯 Tóm tắt (Summary)

**Backend (NestJS):** Dùng `skip` và `limit` để phân trang trong MongoDB.

**Frontend (Next.js):** Chỉ cần gửi `page` và `limit` qua query parameters, backend sẽ tự tính `skip`.

---

## 🔧 Backend (NestJS) - Cách hoạt động

### Công thức tính skip:

```typescript
const skip = (page - 1) * limit;
```

**Ví dụ:**

- Page 1, Limit 10 → Skip = (1-1) \* 10 = 0 (lấy từ bản ghi đầu tiên)
- Page 2, Limit 10 → Skip = (2-1) \* 10 = 10 (bỏ qua 10 bản ghi đầu)
- Page 3, Limit 10 → Skip = (3-1) \* 10 = 20 (bỏ qua 20 bản ghi đầu)

### Code trong Service:

```typescript
async findAllWithPagination(query: QueryProductDto) {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit; // ✅ Backend tự tính skip

  const [data, total] = await Promise.all([
    this.productModel.find().skip(skip).limit(limit).exec(), // ✅ Dùng skip và limit
    this.productModel.countDocuments().exec(),
  ]);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
```

---

## 🌐 Frontend (Next.js) - Cách gọi API

### ❌ KHÔNG cần tính skip ở frontend!

Frontend chỉ cần gửi `page` và `limit`, backend sẽ tự tính `skip`.

### Ví dụ gọi API từ Next.js:

#### 1. Sử dụng fetch (Client Component):

```typescript
'use client';

import { useState, useEffect } from 'react';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    // ✅ Chỉ gửi page và limit, KHÔNG cần skip
    fetch(`http://localhost:3000/products?page=${page}&limit=${limit}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.data);
        setPagination(data.pagination);
      });
  }, [page]);

  return (
    <div>
      <h1>Products</h1>
      {products.map((product) => (
        <div key={product._id}>{product.name}</div>
      ))}

      {/* Pagination controls */}
      <div>
        <button
          onClick={() => setPage(page - 1)}
          disabled={!pagination?.hasPrevPage}
        >
          Previous
        </button>
        <span>Page {page} of {pagination?.totalPages}</span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={!pagination?.hasNextPage}
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

#### 2. Sử dụng Server Component (Next.js 13+):

```typescript
// app/products/page.tsx
interface Product {
  _id: string;
  name: string;
  price: number;
}

interface PaginationResponse {
  data: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { page?: string; limit?: string };
}) {
  const page = searchParams.page || '1';
  const limit = searchParams.limit || '10';

  // ✅ Chỉ gửi page và limit
  const response = await fetch(
    `http://localhost:3000/products?page=${page}&limit=${limit}`,
    { cache: 'no-store' }
  );

  const result: PaginationResponse = await response.json();

  return (
    <div>
      <h1>Products</h1>
      {result.data.map((product) => (
        <div key={product._id}>{product.name}</div>
      ))}

      <div>
        <p>
          Page {result.pagination.page} of {result.pagination.totalPages}
        </p>
        <p>Total: {result.pagination.total} products</p>
      </div>
    </div>
  );
}
```

#### 3. Sử dụng Service trong Next.js:

```typescript
// services/product.service.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export async function getProducts(params: PaginationParams = {}) {
  // ✅ Build query string với page và limit
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.search) queryParams.append('search', params.search);
  if (params.category) queryParams.append('category', params.category);
  if (params.minPrice)
    queryParams.append('minPrice', params.minPrice.toString());
  if (params.maxPrice)
    queryParams.append('maxPrice', params.maxPrice.toString());
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const response = await fetch(`${API_URL}/products?${queryParams.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  return response.json();
}

// Sử dụng
const result = await getProducts({ page: 1, limit: 10 });
console.log(result.data); // Array of products
console.log(result.pagination); // Pagination info
```

---

## 📊 Response Format (Định dạng Response)

### Khi có pagination:

```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "iPhone 15",
      "price": 25000000,
      "category": "Điện thoại"
    }
    // ... more products
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Khi không có query params (backward compatible):

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "iPhone 15",
    "price": 25000000
  }
  // ... all products
]
```

---

## 🔍 Các tính năng hỗ trợ

### 1. Pagination (Phân trang)

```typescript
// Next.js
fetch('/products?page=2&limit=20');
```

### 2. Search (Tìm kiếm)

```typescript
// Next.js
fetch('/products?page=1&limit=10&search=iphone');
```

### 3. Filter (Lọc)

```typescript
// Next.js
fetch('/products?category=Điện thoại&minPrice=1000000&maxPrice=5000000');
```

### 4. Sort (Sắp xếp)

```typescript
// Next.js
fetch('/products?sortBy=price&sortOrder=asc');
```

### 5. Kết hợp tất cả

```typescript
// Next.js
fetch(
  '/products?page=1&limit=10&search=iphone&category=Điện thoại&minPrice=1000000&sortBy=price&sortOrder=asc',
);
```

---

## ✅ Tóm tắt

| Vị trí                 | Cần làm gì                                           | Ví dụ                     |
| ---------------------- | ---------------------------------------------------- | ------------------------- |
| **Backend (NestJS)**   | Tính `skip = (page - 1) * limit` và dùng trong query | `skip(skip).limit(limit)` |
| **Frontend (Next.js)** | Chỉ gửi `page` và `limit` qua query params           | `?page=1&limit=10`        |

**Kết luận:** Frontend KHÔNG cần tính skip, chỉ cần gửi page và limit. Backend sẽ tự động tính skip và xử lý phân trang.

---

## 🎯 Ví dụ hoàn chỉnh

### Backend API Endpoint:

```
GET /products?page=2&limit=10&search=iphone&category=Điện thoại
```

### Backend xử lý:

```typescript
// page = 2, limit = 10
const skip = (2 - 1) * 10 = 10; // ✅ Backend tự tính

// Query MongoDB
db.products.find().skip(10).limit(10) // ✅ Dùng skip và limit
```

### Frontend gọi:

```typescript
// ✅ Chỉ cần gửi page và limit
const response = await fetch('/products?page=2&limit=10&search=iphone');
```

---

**Happy Coding! 🎉**

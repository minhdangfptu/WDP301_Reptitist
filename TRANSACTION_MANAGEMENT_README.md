# Transaction Management System

## Tổng quan

Hệ thống quản lý giao dịch (Transaction Management) đã được cập nhật để hoạt động hoàn toàn với backend và database. Hệ thống bao gồm:

### Backend Features
- **API Endpoints**: Đầy đủ CRUD operations cho transactions
- **VNPay Integration**: Tích hợp thanh toán qua VNPay
- **Admin Controls**: Quyền admin để quản lý tất cả giao dịch
- **Data Validation**: Kiểm tra dữ liệu và quyền truy cập

### Frontend Features
- **Admin Dashboard**: Giao diện quản lý giao dịch cho admin
- **Real-time Charts**: Biểu đồ thống kê trực quan
- **Filter & Search**: Lọc và tìm kiếm giao dịch
- **CRUD Operations**: Thêm, sửa, xóa giao dịch

## API Endpoints

### 1. Lấy tất cả giao dịch (Admin only)
```
GET /reptitist/transactions/all
Headers: Authorization: Bearer <token>
```

### 2. Lấy giao dịch theo ID (Admin only)
```
GET /reptitist/transactions/:id
Headers: Authorization: Bearer <token>
```

### 3. Cập nhật giao dịch (Admin only)
```
PUT /reptitist/transactions/:id
Headers: Authorization: Bearer <token>
Body: {
  "status": "completed|pending|failed|refunded",
  "description": "Mô tả giao dịch"
}
```

### 4. Xóa giao dịch (Admin only)
```
DELETE /reptitist/transactions/:id
Headers: Authorization: Bearer <token>
```

### 5. Lấy lịch sử giao dịch của user
```
GET /reptitist/transactions/history/:userId
Headers: Authorization: Bearer <token>
```

### 6. Lọc lịch sử giao dịch
```
GET /reptitist/transactions/history/filter/:userId?status=completed&start_date=2024-01-01&end_date=2024-12-31
Headers: Authorization: Bearer <token>
```

### 7. Tạo URL thanh toán
```
GET /reptitist/transactions/create?amount=100000&user_id=xxx&description=xxx
Headers: Authorization: Bearer <token>
```

### 8. Xử lý callback từ VNPay
```
GET /reptitist/transactions/return
```

### 9. Hoàn tiền giao dịch
```
POST /reptitist/transactions/refund/:transaction_id
Headers: Authorization: Bearer <token>
```

## Database Schema

### Transaction Model
```javascript
{
  amount: Number,           // Số tiền giao dịch
  net_amount: Number,       // Số tiền sau phí
  fee: Number,             // Phí giao dịch
  currency: String,        // Loại tiền tệ (VND)
  transaction_type: String, // Loại giao dịch (payment/refund)
  status: String,          // Trạng thái (pending/completed/failed/refunded)
  description: String,     // Mô tả giao dịch
  items: String,           // Thông tin items (JSON string)
  user_id: ObjectId,       // ID của user
  is_test: Boolean,        // Có phải test transaction không
  refund_transaction_id: ObjectId, // ID giao dịch hoàn tiền
  transaction_date: Date,  // Ngày giao dịch
  
  // VNPay specific fields
  vnp_txn_ref: String,     // Mã giao dịch VNPay
  vnp_response_code: String, // Mã phản hồi VNPay
  vnp_transaction_no: String, // Số giao dịch VNPay
  raw_response: Mixed      // Phản hồi thô từ VNPay
}
```

## Frontend Component

### AdminTransactionManagement.jsx
Component chính để quản lý giao dịch với các tính năng:

1. **Dashboard Overview**
   - Biểu đồ trạng thái giao dịch
   - Biểu đồ tổng tiền theo ngày
   - Biểu đồ loại giao dịch

2. **Filter & Search**
   - Lọc theo trạng thái
   - Lọc theo thời gian
   - Tìm kiếm theo tên user

3. **Transaction Table**
   - Hiển thị danh sách giao dịch
   - Thông tin chi tiết: ID, User, Loại, Số tiền, Trạng thái, Ngày
   - Actions: Edit, Delete

4. **CRUD Operations**
   - **Edit**: Cập nhật trạng thái và mô tả
   - **Delete**: Xóa giao dịch (chỉ pending/failed)

## Cách sử dụng

### 1. Khởi động hệ thống
```bash
# Backend
cd backend
npm install
npm start

# Frontend
cd frontend
npm install
npm run dev
```

### 2. Truy cập Admin Dashboard
- Đăng nhập với tài khoản admin
- Truy cập `/admin-transaction-management`
- Hoặc điều hướng qua menu admin

### 3. Quản lý giao dịch
- **Xem danh sách**: Tự động load khi vào trang
- **Lọc dữ liệu**: Sử dụng các filter ở đầu trang
- **Chỉnh sửa**: Click nút edit (✏️) trên từng dòng
- **Xóa**: Click nút delete (🗑️) trên từng dòng

### 4. Thống kê
- Xem biểu đồ trực quan ở phần đầu trang
- Dữ liệu tự động cập nhật theo filter

## Security Features

1. **Authentication**: Tất cả endpoints yêu cầu token
2. **Authorization**: Chỉ admin mới có quyền quản lý
3. **Data Validation**: Kiểm tra dữ liệu đầu vào
4. **Safe Operations**: Chỉ cho phép xóa giao dịch chưa hoàn thành

## Error Handling

- **Frontend**: Hiển thị thông báo lỗi rõ ràng
- **Backend**: Trả về error messages chi tiết
- **Logging**: Ghi log lỗi để debug

## Testing

Chạy test API:
```bash
cd backend
node test-transaction-api.js
```

## Notes

- Giao dịch đã hoàn thành (completed) không thể xóa
- Chỉ có thể cập nhật trạng thái và mô tả
- Tất cả thay đổi được log để audit
- Hệ thống tương thích với VNPay payment gateway 
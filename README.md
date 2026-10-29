# 235985_TangThienThanh

Ứng dụng quản lý món ăn. Repository này khởi tạo frontend và backend API; các chức năng quản lý món ăn và kết nối MongoDB Atlas sẽ được phát triển tiếp theo.

## Công nghệ

- Frontend: React, Vite
- Backend: Node.js, Express
- Cơ sở dữ liệu dự kiến: MongoDB Atlas, database `235985_TangThienThanh`, collection `foods`
- Đóng gói và triển khai dự kiến: Docker, Docker Hub, Render

## Cấu trúc dự án

```text
frontend/
  public/                 Tài nguyên tĩnh
  src/
    assets/               Hình ảnh, font và tài nguyên giao diện
    components/           Thành phần giao diện dùng lại
    pages/                Các trang
    services/             Giao tiếp với backend API
    styles/               CSS dùng chung
    App.jsx               Giao diện chính
    main.jsx              Điểm khởi chạy frontend
  tests/                  Kiểm thử frontend
backend/
  src/
    config/               Cấu hình ứng dụng
    controllers/          Xử lý request
    middleware/           Middleware
    models/               Mô hình dữ liệu
    routes/               Khai báo API routes
    services/             Nghiệp vụ
    utils/                Tiện ích dùng chung
    app.js                Khởi tạo Express và API
    server.js             Điểm khởi chạy backend
  tests/                  Kiểm thử backend
```

## Yêu cầu

- Node.js 20 trở lên và npm
- Git
- MongoDB Atlas sẽ cần thiết khi triển khai chức năng lưu món ăn

## Cài đặt và chạy ở môi trường phát triển

1. Tạo file cấu hình backend từ mẫu:

   ```powershell
   Copy-Item backend\.env.example backend\.env
   ```

2. Cài dependencies và chạy backend trong một cửa sổ terminal:

   ```powershell
   cd backend
   npm install
   npm run dev
   ```

   Backend mặc định chạy tại `http://localhost:5000`. Kiểm tra API tại `http://localhost:5000/api/health`.

3. Mở terminal khác tại thư mục gốc, cài dependencies và chạy frontend:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

   Truy cập URL Vite hiển thị trong terminal (mặc định `http://localhost:5173`). Frontend chuyển tiếp request `/api` đến backend.

## Bảo mật cấu hình

- Không commit `.env`, mật khẩu, access token hoặc connection string MongoDB.
- Tạo cấu hình cục bộ từ `backend/.env.example`; chỉ chia sẻ các biến mẫu không chứa giá trị bí mật.
- Nếu thông tin bí mật bị lộ, hãy thu hồi hoặc thay mới thông tin đó.

## Trạng thái

Frontend và backend hiện có trang khởi tạo và API kiểm tra trạng thái. Các chức năng CRUD món ăn, tích hợp MongoDB Atlas, Docker và triển khai Render chưa được cấu hình.

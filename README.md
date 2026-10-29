# 235985_TangThienThanh

Ứng dụng quản lý món ăn với frontend React và backend REST API; backend lưu dữ liệu món ăn trên MongoDB Atlas.

## Công nghệ

- Frontend: React, Vite
- Backend: Node.js, Express
- Cơ sở dữ liệu: MongoDB Atlas, database `235985_TangThienThanh`, collection `foods`
- Đóng gói và triển khai dự kiến: Docker, Docker Hub, Render

## Cấu trúc dự án

```text
frontend/
  public/                 Tài nguyên tĩnh
  src/
    assets/               Hình ảnh, font và tài nguyên giao diện
    components/           Thành phần giao diện dùng lại
      FoodForm.jsx        Biểu mẫu thêm và sửa món ăn
    pages/                Các trang
    services/             Giao tiếp với backend API
      foodsApi.js         Giao tiếp với foods API
    styles/               CSS dùng chung
    App.jsx               Giao diện chính
    main.jsx              Điểm khởi chạy frontend
  tests/                  Kiểm thử frontend
backend/
  src/
    config/               Cấu hình ứng dụng
    controllers/          Xử lý request món ăn
    middleware/           Xử lý lỗi API
    models/               Mô hình dữ liệu Food
    routes/               Khai báo API routes
    services/             Nghiệp vụ
    utils/                Tiện ích dùng chung
    config/database.js    Kết nối MongoDB
    app.js                Khởi tạo Express và API
    server.js             Điểm khởi chạy backend
  tests/                  Kiểm thử API
```

## Yêu cầu

- Node.js 20 trở lên và npm
- Git
- MongoDB Atlas hoặc MongoDB tương thích

## Cài đặt và chạy ở môi trường phát triển

1. Tạo file cấu hình backend từ mẫu, sau đó thay `<username>`, `<password>` và `<cluster-host>` trong `MONGODB_URI` bằng thông tin MongoDB Atlas của bạn:

   ```powershell
   Copy-Item backend\.env.example backend\.env
   ```

2. Cài dependencies và chạy backend trong một cửa sổ terminal:

   ```powershell
   cd backend
   npm install
   npm run dev
   ```

   Backend mặc định chạy tại `http://localhost:5000`. Kiểm tra trạng thái tại `http://localhost:5000/health` (tương thích thêm với `/api/health`).

3. Mở terminal khác tại thư mục gốc, cài dependencies và chạy frontend:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

   Truy cập URL Vite hiển thị trong terminal (mặc định `http://localhost:5173`). Frontend chuyển tiếp request `/api` đến backend.

   Để cấu hình frontend gọi trực tiếp backend khi triển khai, tạo `frontend/.env` từ mẫu `frontend/.env.example` và đặt `VITE_API_URL` bằng URL backend (ví dụ `https://api.example.com`). Cấu hình `FRONTEND_ORIGIN` trong backend bằng origin của frontend (ví dụ `https://web.example.com`); có thể khai báo nhiều origin cách nhau bằng dấu phẩy. Giá trị `VITE_API_URL` để trống sẽ dùng proxy của Vite khi phát triển cục bộ. Sau khi thay biến môi trường Vite, khởi động lại frontend hoặc build lại ứng dụng.

## Bảo mật cấu hình

- Không commit `.env`, mật khẩu, access token hoặc connection string MongoDB.
- Tạo cấu hình cục bộ từ `backend/.env.example`; chỉ chia sẻ các biến mẫu không chứa giá trị bí mật.
- Nếu thông tin bí mật bị lộ, hãy thu hồi hoặc thay mới thông tin đó.

## Backend API

| Phương thức | Endpoint | Chức năng |
|---|---|---|
| GET | `/api/foods` | Lấy danh sách món ăn |
| GET | `/api/foods?search=pho` | Tìm theo tên món, loại món hoặc vùng miền |
| GET | `/api/foods/:id` | Xem chi tiết món ăn |
| POST | `/api/foods` | Thêm món ăn |
| PUT | `/api/foods/:id` | Cập nhật món ăn |
| DELETE | `/api/foods/:id` | Xóa món ăn |
| GET | `/health` | Kiểm tra backend và kết nối cơ sở dữ liệu |

Món ăn cần có `foodId`, `name` và `category`; `foodId` không được trùng. `region`, `description` và `price` là tùy chọn. Ví dụ tạo món ăn:

```json
{
  "foodId": "FOOD-001",
  "name": "Phở bò",
  "category": "Món nước",
  "region": "Miền Bắc",
  "description": "Phở truyền thống",
  "price": 50000
}
```

Chạy kiểm thử API (dùng MongoDB tạm thời, không cần Atlas):

```powershell
cd backend
npm test
```

## Câu 5 — Đóng gói backend bằng Docker

Từ thư mục gốc, tạo cấu hình backend riêng ở `backend/.env` theo phần cài đặt ở trên, sau đó build và chạy container:

```powershell
docker build -t 235985tangthienthanh/backend:latest ./backend
docker run -d --name food-backend -p 5000:5000 --env-file backend/.env 235985tangthienthanh/backend:latest
docker ps
curl.exe http://localhost:5000/health
```

Container cần `PORT`, `MONGODB_URI` và `FRONTEND_ORIGIN`; không có biến bí mật nào được đưa vào image. Theo dõi log bằng `docker logs -f food-backend` và dừng/xóa container bằng `docker rm -f food-backend`.

Image backend: `docker.io/235985tangthienthanh/backend:latest`. Đăng nhập Docker Hub bằng `docker login`, sau đó đẩy image bằng:

```powershell
docker push 235985tangthienthanh/backend:latest
```

Image repository: [hub.docker.com/r/235985tangthienthanh/backend](https://hub.docker.com/r/235985tangthienthanh/backend).

# 🚀 Khởi động Dự Án

Làm theo các bước dưới đây để thiết lập và chạy dự án một cách đầy đủ.

## 🐳 1. Khởi động Docker

Mở **Docker Desktop** trên máy tính của bạn.

## ⚙️ 2. Chạy các dịch vụ bằng Docker Compose

Mở terminal và chạy lệnh:

```bash
docker compose up
```

## 📝 3. Cấu hình biến môi trường

Mở file `.env` và chỉnh sửa các giá trị theo yêu cầu.  
**Lưu ý:** Sau này bạn sẽ cần cập nhật `ADMIN_KEY` trong file này sau khi khởi tạo.

## 🔑 4. Tạo khóa quản trị viên (Admin Key)

Chạy lệnh sau trong terminal:

```bash
docker compose exec backend ./generate_admin_key.sh
```

Lệnh này sẽ tạo ra một **Admin Key** dùng để đăng nhập hệ thống quản trị.

## 🛠️ 5. Cập nhật khóa ADMIN_KEY

Mở lại file `.env` và:

- Tìm dòng `ADMIN_KEY=...`
- Thay thế bằng giá trị key vừa được tạo ở bước trước.

## 🔐 6. Đăng nhập hệ thống quản trị

Truy cập địa chỉ sau bằng trình duyệt:

```
http://localhost:6791
```

- Dán `ADMIN_KEY` để đăng nhập.

## 📦 7. Cài đặt các gói phụ thuộc

Chạy hai lệnh sau trong terminal:

```bash
npm install convex@latest
npm install
```

> 💡 **Lưu ý:** `convex@latest` đảm bảo bạn luôn sử dụng phiên bản mới nhất của thư viện.

## 🖥️ 8. Khởi chạy ứng dụng

Cuối cùng, chạy ứng dụng bằng lệnh:

```bash
npm run dev
```

Ứng dụng sẽ được khởi động tại địa chỉ mặc định:  
[http://localhost:3000](http://localhost:3000) *(hoặc tùy thuộc cấu hình)*

---

✅ **Chúc bạn chạy dự án thành công!**

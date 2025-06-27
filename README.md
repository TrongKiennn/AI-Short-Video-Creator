# 🚀 Khởi động Dự Án

Làm theo các bước dưới đây để thiết lập và chạy dự án một cách đầy đủ.

## 📦 1. Cài đặt các gói phụ thuộc

Lần lượt chạy các lệnh sau trong terminal để cài đặt các thư viện cần thiết:

```bash
npm install
npm install next-themes
```

> 💡 `next-themes` được dùng để hỗ trợ thay đổi giao diện sáng/tối (dark/light mode) trong ứng dụng Next.js.

## 🐳 2. Khởi động Docker

Mở **Docker Desktop** trên máy tính của bạn.

## ⚙️ 3. Chạy các dịch vụ bằng Docker Compose

Mở terminal và chạy lệnh:

```bash
docker compose up
```

## 📝 4. Cấu hình biến môi trường

Mở file `.env.local` và chỉnh sửa các giá trị theo yêu cầu.  
**Lưu ý:** Sau này bạn sẽ cần cập nhật `ADMIN_KEY` trong file `.env.local` sau khi khởi tạo.

## 🔑 5. Tạo khóa quản trị viên (Admin Key)

Chạy lệnh sau trong terminal:

```bash
docker compose exec backend ./generate_admin_key.sh
```

Lệnh này sẽ tạo ra một **Admin Key** dùng để đăng nhập hệ thống quản trị.

## 🛠️ 6. Cập nhật khóa ADMIN_KEY

Mở lại file `.env.local` và:

- Tìm dòng `ADMIN_KEY=...`
- Thay thế bằng giá trị key vừa được tạo ở bước trước.

## 🔐 7. Đăng nhập hệ thống quản trị

Truy cập địa chỉ sau bằng trình duyệt:

```
http://localhost:6791
```

- Dán `ADMIN_KEY` để đăng nhập.

## 📦 8. Cài đặt các gói phụ thuộc

Chạy hai lệnh sau trong terminal:

```bash
npm install convex@latest
npx convex dev

npm install inngest
npx inngest-cli@latest dev
```

> 💡 **Lưu ý:** `convex@latest` đảm bảo bạn luôn sử dụng phiên bản mới nhất của thư viện.

## 🖥️ 9. Khởi chạy ứng dụng

Cuối cùng, chạy ứng dụng bằng lệnh:

```bash
npm run dev
```

Ứng dụng sẽ được khởi động tại địa chỉ mặc định:  
[http://localhost:3000](http://localhost:3000) _(hoặc tùy thuộc cấu hình)_

<b>Sau lần cài đặt đầu tiên, để chạy chương trình một cách cục bộ, chỉ cần chạy 4 lệnh sau, mỗi lệnh ở một terminal riêng

```bash
docker compose up
npx convex dev
npx inngest-cli@latest dev
npm run dev
```

</b>

✅ **Chúc bạn chạy dự án thành công!**

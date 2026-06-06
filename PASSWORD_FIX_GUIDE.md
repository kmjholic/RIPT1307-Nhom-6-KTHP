# Hướng dẫn sửa lỗi 401 - Mã hóa mật khẩu

## 📋 Vấn đề tìm thấy

### ❌ Lỗi gốc (trong `src/server/models/User.ts`)

```typescript
export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt); // ❌ THIẾU await!
}
```

**Nguyên nhân:**

- `bcrypt.hash()` là hàm **async** nhưng **không được `await`**
- Hàm return một **Promise thay vì string hash**
- Database lưu **object Promise** thay vì hash thực
- Khi đăng nhập, `verifyPassword()` so sánh với Promise object → luôn `false` → lỗi 401

### ✅ Giải pháp

**Cách 1 - Sử dụng bcryptjs đúng cách (ĐÃ ĐƯỢC SỬA):**

```typescript
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10); // ✅ Truyền rounds trực tiếp
}

export async function verifyPassword(
  plain: string,
  hash?: string,
): Promise<boolean> {
  if (!hash) return false;
  try {
    return await bcrypt.compare(plain, hash); // ✅ Thêm await
  } catch (error) {
    console.error('[Password Verify] Lỗi so sánh mật khẩu:', error);
    return false;
  }
}
```

**Cách 2 - Tăng độ dài password field (ĐÃ ĐƯỢC SỬA):**

```typescript
password: { type: DataTypes.STRING(255), allowNull: true }  // Từ STRING → STRING(255)
```

---

## 🔧 Hướng dẫn sử dụng

### Bước 1: Xóa dữ liệu cũ

```bash
# Kết nối MySQL và chạy:
DROP DATABASE database_name;
```

Hoặc xóa bảng Users để re-seed:

```sql
TRUNCATE TABLE Users;
```

### Bước 2: Khởi động server (auto-seed database)

```bash
npm run dev
```

Server sẽ tự động:

- Đồng bộ schema (cập nhật password field)
- Seed dữ liệu mẫu với mật khẩu được hash **chính xác**

### Bước 3: Kiểm tra đăng nhập

**Tài khoản mặc định (sau khi seed):**

- Email: `admin@example.com` hoặc `teacher@example.com`
- Mật khẩu: `12345678`

**Test API:**

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"12345678"}'
```

**Response kỳ vọng:**

```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "name": "...", "email": "...", "role": "admin" },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

## 📊 So sánh trước/sau

| Khía cạnh | Trước | Sau |
| --- | --- | --- |
| **Hash creation** | `bcrypt.hash(plain, salt)` (no await) | `bcrypt.hash(plain, 10)` (correct) |
| **Stored value** | Promise object → không hợp lệ | Valid bcrypt hash → hợp lệ |
| **Verify result** | Luôn `false` → 401 error | Đúng mật khẩu → `true` ✅ |
| **Password field length** | STRING (255 default) | STRING(255) (explicit) |

---

## 🧪 Kiểm tra debug

Nếu vẫn gặp 401, kiểm tra:

1. **Xem password field trong database:**

   ```sql
   SELECT id, email, password FROM Users LIMIT 1;
   ```

   Nó phải bắt đầu với `$2a$` hoặc `$2b$` (bcrypt format), VD:

   ```
   $2b$10$aB3cDeF...gH9ijKlMnOpQr
   ```

2. **Kiểm tra seedDatabase() chạy chưa:** Xem console log khi start server có `[Database] Seed bảng Users thành công.` không

3. **Clear node_modules nếu cần:**
   ```bash
   rm -rf node_modules
   npm install
   ```

---

## 📝 Lưu ý bảo mật

- ✅ Mã hóa bcryptjs với salt 10 rounds (chuẩn ngành)
- ✅ Hash không thể reverse (one-way encryption)
- ✅ Mỗi hash là unique dù cùng input (khác salt)
- ⚠️ Đừng lưu mật khẩu plain text
- ⚠️ Đừng log password hoặc hash

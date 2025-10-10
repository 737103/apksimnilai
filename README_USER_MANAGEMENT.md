# 🔐 User Management - Simnilai

Panduan lengkap untuk mengelola username dan password login aplikasi Simnilai.

## 🚀 Quick Start

### 1. Pastikan Server Berjalan
```bash
pnpm dev
```

### 2. Inisialisasi User Default
```bash
# Menggunakan script (Recommended)
.\scripts\admin-users.bat        # Windows
./scripts/admin-users.sh         # Linux/macOS
.\scripts\admin-users.ps1        # PowerShell

# Atau menggunakan API langsung
curl -X POST http://localhost:8080/api/users/init
```

### 3. Login dengan Kredensial Default
- **Username:** `admin` | **Password:** `admin123`
- **Username:** `guru` | **Password:** `guru123`
- **Username:** `dalle` | **Password:** `asrahabu`

## 📁 File yang Dibuat

### Scripts Admin
- `scripts/admin-users.bat` - Windows Batch Script
- `scripts/admin-users.ps1` - PowerShell Script
- `scripts/admin-users.sh` - Bash Script (Linux/macOS)
- `scripts/admin-users.js` - Node.js Script

### API Endpoints
- `server/routes/users.ts` - User management endpoints
- `server/index.ts` - Updated dengan user routes

### Dokumentasi
- `USER_MANAGEMENT.md` - Panduan lengkap
- `IMPROVEMENTS.md` - Updated dengan info user management

## 🔧 API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/users/init` | Inisialisasi user default |
| GET | `/api/users` | Lihat daftar user |
| POST | `/api/users/upsert` | Buat/update user |
| POST | `/api/users/delete` | Hapus user |

## 📊 Database Schema

```sql
CREATE TABLE app_user (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## 🔒 Security Features

- Password hashing menggunakan PostgreSQL `pgcrypto`
- Algoritma Blowfish (`bf`) untuk hashing
- Username unique constraint
- Role-based access control

## 🛠️ Troubleshooting

### Server tidak berjalan
```bash
pnpm dev
```

### Database connection error
Periksa konfigurasi database di `server/db.ts`

### Script tidak bisa dijalankan
```bash
# Linux/macOS
chmod +x scripts/admin-users.sh

# Windows
# Pastikan PowerShell execution policy diizinkan
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 📞 Support

Jika mengalami masalah:
1. Periksa log server
2. Pastikan database Neon terhubung
3. Gunakan script admin untuk operasi yang lebih mudah
4. Lihat dokumentasi lengkap di `USER_MANAGEMENT.md`

# 🔐 Panduan Mengubah Username dan Password Login Aplikasi Simnilai

Aplikasi Simnilai menggunakan database Neon PostgreSQL untuk menyimpan kredensial login user. Berikut adalah panduan lengkap untuk mengubah username dan password login.

## 📋 Prasyarat

1. **Server aplikasi harus berjalan** di `http://localhost:8080`
2. **Database Neon** sudah terhubung dan berfungsi
3. **Node.js** terinstall (untuk script JavaScript)
4. **PowerShell** atau **Bash** (untuk script shell)

## 🚀 Cara Cepat - Menggunakan Script Admin

### Windows (PowerShell)

```powershell
# Jalankan script PowerShell
.\scripts\admin-users.ps1
```

### Linux/macOS (Bash)

```bash
# Berikan permission execute
chmod +x scripts/admin-users.sh

# Jalankan script
./scripts/admin-users.sh
```

### Node.js (Cross-platform)

```bash
# Install dependencies jika belum
npm install pg

# Jalankan script
node scripts/admin-users.js
```

## 🔧 Cara Manual - Menggunakan API Endpoints

### 1. Inisialisasi User Default

```bash
curl -X POST http://localhost:8080/api/users/init \
  -H "Content-Type: application/json"
```

### 2. Lihat Daftar User

```bash
curl -X GET http://localhost:8080/api/users
```

### 3. Ubah Username dan Password

```bash
curl -X POST http://localhost:8080/api/users/upsert \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password_baru",
    "role": "admin"
  }'
```

### 4. Tambah User Baru

```bash
curl -X POST http://localhost:8080/api/users/upsert \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user_baru",
    "password": "password_baru",
    "role": "user"
  }'
```

### 5. Hapus User

```bash
curl -X POST http://localhost:8080/api/users/delete \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user_yang_akan_dihapus"
  }'
```

## 📊 Struktur Database

Tabel `app_user` memiliki struktur berikut:

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

## 🔑 Kredensial Default

Setelah inisialisasi, aplikasi akan memiliki user default:

| Username | Password | Role | Deskripsi |
|----------|----------|------|-----------|
| `admin` | `admin123` | `admin` | Administrator |
| `guru` | `guru123` | `teacher` | Guru/Pengajar |
| `dalle` | `asrahabu` | `user` | User biasa |

## 🛠️ Langkah-langkah Detail

### Langkah 1: Pastikan Server Berjalan

```bash
# Jalankan aplikasi
pnpm dev
```

Pastikan server berjalan di `http://localhost:8080`

### Langkah 2: Inisialisasi Database

Jika ini pertama kali menjalankan aplikasi, inisialisasi user default:

```bash
curl -X POST http://localhost:8080/api/users/init
```

### Langkah 3: Ubah Kredensial

#### Mengubah Password Admin

```bash
curl -X POST http://localhost:8080/api/users/upsert \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password_admin_baru"
  }'
```

#### Mengubah Username dan Password

```bash
curl -X POST http://localhost:8080/api/users/upsert \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password_baru",
    "role": "admin"
  }'
```

### Langkah 4: Verifikasi Perubahan

```bash
curl -X GET http://localhost:8080/api/users
```

## 🔒 Keamanan Password

Aplikasi menggunakan PostgreSQL `pgcrypto` extension dengan algoritma `bf` (Blowfish) untuk hashing password:

```sql
-- Password di-hash menggunakan crypt() dengan salt
password_hash = crypt('password_plain', gen_salt('bf'))
```

## 🚨 Troubleshooting

### Error: "User tidak ditemukan"

Pastikan username yang dimasukkan sudah ada di database:

```bash
curl -X GET http://localhost:8080/api/users
```

### Error: "Terjadi kesalahan pada server"

1. Pastikan server aplikasi berjalan
2. Periksa koneksi database
3. Lihat log server untuk detail error

### Error: "Username sudah ada"

Gunakan endpoint update untuk mengubah user yang sudah ada, atau gunakan username yang berbeda.

## 📝 Contoh Penggunaan Lengkap

### Skenario: Mengubah password admin dari default ke password yang lebih aman

```bash
# 1. Lihat user yang ada
curl -X GET http://localhost:8080/api/users

# 2. Ubah password admin
curl -X POST http://localhost:8080/api/users/upsert \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "AdminSimnilai2024!"
  }'

# 3. Verifikasi perubahan
curl -X GET http://localhost:8080/api/users
```

### Skenario: Membuat user baru untuk guru

```bash
# Buat user guru baru
curl -X POST http://localhost:8080/api/users/upsert \
  -H "Content-Type: application/json" \
  -d '{
    "username": "guru_matematika",
    "password": "GuruMath2024!",
    "role": "teacher"
  }'
```

## 🔄 Reset ke Default

Jika ingin mengembalikan ke kredensial default:

```bash
# Hapus semua user
curl -X POST http://localhost:8080/api/users/delete \
  -H "Content-Type: application/json" \
  -d '{"username": "admin"}'

curl -X POST http://localhost:8080/api/users/delete \
  -H "Content-Type: application/json" \
  -d '{"username": "guru"}'

curl -X POST http://localhost:8080/api/users/delete \
  -H "Content-Type: application/json" \
  -d '{"username": "dalle"}'

# Inisialisasi ulang
curl -X POST http://localhost:8080/api/users/init
```

## 📞 Bantuan

Jika mengalami masalah:

1. Periksa log server di terminal
2. Pastikan database Neon terhubung
3. Verifikasi endpoint API dengan `curl` atau Postman
4. Gunakan script admin untuk operasi yang lebih mudah

---

**Catatan Penting:** 
- Password disimpan dalam bentuk hash, tidak dapat dilihat dalam bentuk plain text
- Setiap perubahan password akan menghasilkan hash yang berbeda
- Username harus unik dalam database
- Role yang tersedia: `admin`, `teacher`, `user`

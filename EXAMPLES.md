# 🎯 Contoh Penggunaan - Mengubah Username dan Password

Berikut adalah contoh-contoh praktis untuk mengubah kredensial login aplikasi Simnilai.

## 📋 Skenario 1: Mengubah Password Admin

### Menggunakan Script (Termudah)

**Windows:**
```cmd
# Jalankan script batch
admin-users.bat

# Pilih menu 3 (Ubah user)
# Masukkan username: admin
# Masukkan password baru: AdminSimnilai2024!
# Masukkan role: admin
```

**Linux/macOS:**
```bash
# Jalankan script bash
./scripts/admin-users.sh

# Pilih menu 3 (Ubah user)
# Masukkan username: admin
# Masukkan password baru: AdminSimnilai2024!
# Masukkan role: admin
```

### Menggunakan API Langsung

```bash
curl -X POST http://localhost:8080/api/users/upsert \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "AdminSimnilai2024!"
  }'
```

## 📋 Skenario 2: Membuat User Baru untuk Guru

### Menggunakan Script

```bash
# Jalankan script admin
./scripts/admin-users.sh

# Pilih menu 4 (Tambah user baru)
# Username: guru_matematika
# Password: GuruMath2024!
# Role: teacher
```

### Menggunakan API

```bash
curl -X POST http://localhost:8080/api/users/upsert \
  -H "Content-Type: application/json" \
  -d '{
    "username": "guru_matematika",
    "password": "GuruMath2024!",
    "role": "teacher"
  }'
```

## 📋 Skenario 3: Mengubah Username dan Password Sekaligus

### Menggunakan Script

```bash
# Jalankan script admin
./scripts/admin-users.sh

# Pilih menu 3 (Ubah user)
# Username lama: admin
# Username baru: administrator
# Password baru: AdminBaru2024!
# Role: admin
```

### Menggunakan API

```bash
curl -X POST http://localhost:8080/api/users/upsert \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "AdminBaru2024!",
    "role": "admin"
  }'
```

## 📋 Skenario 4: Reset ke Kredensial Default

### Menggunakan Script

```bash
# Jalankan script admin
./scripts/admin-users.sh

# Pilih menu 5 (Hapus user) untuk setiap user
# Kemudian pilih menu 1 (Inisialisasi user default)
```

### Menggunakan API

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

## 📋 Skenario 5: Melihat Daftar User

### Menggunakan Script

```bash
# Jalankan script admin
./scripts/admin-users.sh

# Pilih menu 2 (Lihat daftar user)
```

### Menggunakan API

```bash
curl -X GET http://localhost:8080/api/users
```

**Output:**
```json
{
  "success": true,
  "users": [
    {
      "id": "uuid-here",
      "username": "admin",
      "role": "admin",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## 🔧 Troubleshooting

### Error: "User tidak ditemukan"

**Solusi:**
1. Periksa username yang dimasukkan
2. Lihat daftar user yang ada:
   ```bash
   curl -X GET http://localhost:8080/api/users
   ```

### Error: "Server tidak merespons"

**Solusi:**
1. Pastikan server berjalan:
   ```bash
   pnpm dev
   ```
2. Periksa apakah server berjalan di port 8080

### Error: "Database connection error"

**Solusi:**
1. Periksa koneksi database Neon
2. Lihat log server untuk detail error
3. Pastikan konfigurasi database benar di `server/db.ts`

## 💡 Tips dan Best Practices

### 1. Gunakan Password yang Kuat
- Minimal 8 karakter
- Kombinasi huruf besar, huruf kecil, angka, dan simbol
- Contoh: `AdminSimnilai2024!`

### 2. Backup Kredensial
- Simpan kredensial di tempat yang aman
- Jangan hardcode password di kode

### 3. Role Management
- `admin`: Akses penuh
- `teacher`: Akses untuk guru
- `user`: Akses terbatas

### 4. Regular Security Check
- Ubah password secara berkala
- Hapus user yang tidak digunakan
- Monitor aktivitas login

## 🚀 Quick Commands

```bash
# Inisialisasi user default
curl -X POST http://localhost:8080/api/users/init

# Ubah password admin
curl -X POST http://localhost:8080/api/users/upsert \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password_baru"}'

# Lihat semua user
curl -X GET http://localhost:8080/api/users

# Hapus user
curl -X POST http://localhost:8080/api/users/delete \
  -H "Content-Type: application/json" \
  -d '{"username": "username_yang_akan_dihapus"}'
```

@echo off
chcp 65001 >nul
title Admin Panel - Simnilai User Management

echo 🔐 Script Admin - Ubah Kredensial Login Simnilai
echo ================================================
echo.

:menu
echo.
echo Pilih operasi yang ingin dilakukan:
echo 1. Inisialisasi user default
echo 2. Lihat daftar user
echo 3. Ubah username dan password
echo 4. Tambah user baru
echo 5. Hapus user
echo 6. Keluar
echo.

set /p choice="Pilih menu (1-6): "

if "%choice%"=="1" goto init_users
if "%choice%"=="2" goto list_users
if "%choice%"=="3" goto update_user
if "%choice%"=="4" goto create_user
if "%choice%"=="5" goto delete_user
if "%choice%"=="6" goto exit
echo ❌ Pilihan tidak valid
goto menu

:init_users
echo.
echo 🔄 Menginisialisasi user default...
curl -s -X POST http://localhost:8080/api/users/init -H "Content-Type: application/json"
if %errorlevel%==0 (
    echo ✅ User default berhasil diinisialisasi!
    echo.
    echo Kredensial default:
    echo - Username: admin ^| Password: admin123 ^| Role: admin
    echo - Username: guru ^| Password: guru123 ^| Role: teacher
    echo - Username: dalle ^| Password: asrahabu ^| Role: user
) else (
    echo ❌ Gagal menginisialisasi user default
)
goto continue

:list_users
echo.
echo 📋 Daftar User:
echo ===============
curl -s -X GET http://localhost:8080/api/users
goto continue

:update_user
echo.
set /p old_username="Masukkan username yang akan diubah: "
if "%old_username%"=="" (
    echo ❌ Username tidak boleh kosong
    goto continue
)

set /p new_username="Masukkan username baru (kosongkan jika tidak ingin mengubah): "
set /p new_password="Masukkan password baru (kosongkan jika tidak ingin mengubah): "
set /p new_role="Masukkan role baru (admin/teacher/user, kosongkan jika tidak ingin mengubah): "

echo 🔄 Mengubah user...
curl -s -X POST http://localhost:8080/api/users/upsert -H "Content-Type: application/json" -d "{\"username\":\"%old_username%\",\"password\":\"%new_password%\",\"role\":\"%new_role%\"}"
goto continue

:create_user
echo.
set /p username="Masukkan username baru: "
set /p password="Masukkan password: "
set /p role="Masukkan role (admin/teacher/user): "

if "%username%"=="" (
    echo ❌ Username tidak boleh kosong
    goto continue
)

echo 🔄 Membuat user baru...
curl -s -X POST http://localhost:8080/api/users/upsert -H "Content-Type: application/json" -d "{\"username\":\"%username%\",\"password\":\"%password%\",\"role\":\"%role%\"}"
goto continue

:delete_user
echo.
set /p username="Masukkan username yang akan dihapus: "
if "%username%"=="" (
    echo ❌ Username tidak boleh kosong
    goto continue
)

echo 🔄 Menghapus user...
curl -s -X POST http://localhost:8080/api/users/delete -H "Content-Type: application/json" -d "{\"username\":\"%username%\"}"
goto continue

:continue
echo.
pause
goto menu

:exit
echo.
echo 👋 Terima kasih!
pause
exit

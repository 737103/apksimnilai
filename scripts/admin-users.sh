#!/bin/bash

# Script untuk mengubah username dan password login aplikasi Simnilai
# Pastikan server aplikasi sudah berjalan di http://localhost:8080

echo "🔐 Script Admin - Ubah Kredensial Login Simnilai"
echo "================================================"

# Fungsi untuk menampilkan menu
show_menu() {
    echo ""
    echo "Pilih operasi yang ingin dilakukan:"
    echo "1. Inisialisasi user default"
    echo "2. Lihat daftar user"
    echo "3. Ubah username dan password"
    echo "4. Tambah user baru"
    echo "5. Hapus user"
    echo "6. Keluar"
    echo ""
}

# Fungsi untuk inisialisasi user default
init_default_users() {
    echo "🔄 Menginisialisasi user default..."
    
    response=$(curl -s -X POST http://localhost:8080/api/users/init \
        -H "Content-Type: application/json")
    
    if echo "$response" | grep -q '"success":true'; then
        echo "✅ User default berhasil diinisialisasi!"
        echo ""
        echo "Kredensial default:"
        echo "- Username: admin | Password: admin123 | Role: admin"
        echo "- Username: guru | Password: guru123 | Role: teacher"
        echo "- Username: dalle | Password: asrahabu | Role: user"
    else
        echo "❌ Gagal menginisialisasi user default"
        echo "Response: $response"
    fi
}

# Fungsi untuk melihat daftar user
list_users() {
    echo "📋 Daftar User:"
    echo "==============="
    
    response=$(curl -s -X GET http://localhost:8080/api/users)
    
    if echo "$response" | grep -q '"success":true'; then
        echo "$response" | jq -r '.users[] | "Username: \(.username) | Role: \(.role) | Dibuat: \(.created_at)"'
    else
        echo "❌ Gagal mengambil daftar user"
        echo "Response: $response"
    fi
}

# Fungsi untuk mengubah user
update_user() {
    echo ""
    read -p "Masukkan username yang akan diubah: " old_username
    
    if [ -z "$old_username" ]; then
        echo "❌ Username tidak boleh kosong"
        return
    fi
    
    read -p "Masukkan username baru (kosongkan jika tidak ingin mengubah): " new_username
    read -p "Masukkan password baru (kosongkan jika tidak ingin mengubah): " new_password
    read -p "Masukkan role baru (admin/teacher/user, kosongkan jika tidak ingin mengubah): " new_role
    
    # Buat JSON payload
    json_payload="{"
    json_payload+="\"username\":\"$old_username\""
    
    if [ ! -z "$new_username" ]; then
        json_payload+=",\"new_username\":\"$new_username\""
    fi
    
    if [ ! -z "$new_password" ]; then
        json_payload+=",\"password\":\"$new_password\""
    fi
    
    if [ ! -z "$new_role" ]; then
        json_payload+=",\"role\":\"$new_role\""
    fi
    
    json_payload+="}"
    
    echo "🔄 Mengubah user..."
    
    response=$(curl -s -X POST http://localhost:8080/api/users/upsert \
        -H "Content-Type: application/json" \
        -d "$json_payload")
    
    if echo "$response" | grep -q '"success":true'; then
        echo "✅ User berhasil diubah!"
    else
        echo "❌ Gagal mengubah user"
        echo "Response: $response"
    fi
}

# Fungsi untuk menambah user baru
create_user() {
    echo ""
    read -p "Masukkan username baru: " username
    read -p "Masukkan password: " password
    read -p "Masukkan role (admin/teacher/user): " role
    
    if [ -z "$username" ] || [ -z "$password" ]; then
        echo "❌ Username dan password tidak boleh kosong"
        return
    fi
    
    json_payload="{\"username\":\"$username\",\"password\":\"$password\",\"role\":\"${role:-user}\"}"
    
    echo "🔄 Membuat user baru..."
    
    response=$(curl -s -X POST http://localhost:8080/api/users/upsert \
        -H "Content-Type: application/json" \
        -d "$json_payload")
    
    if echo "$response" | grep -q '"success":true'; then
        echo "✅ User baru berhasil dibuat!"
    else
        echo "❌ Gagal membuat user baru"
        echo "Response: $response"
    fi
}

# Fungsi untuk menghapus user
delete_user() {
    echo ""
    read -p "Masukkan username yang akan dihapus: " username
    
    if [ -z "$username" ]; then
        echo "❌ Username tidak boleh kosong"
        return
    fi
    
    json_payload="{\"username\":\"$username\"}"
    
    echo "🔄 Menghapus user..."
    
    response=$(curl -s -X POST http://localhost:8080/api/users/delete \
        -H "Content-Type: application/json" \
        -d "$json_payload")
    
    if echo "$response" | grep -q '"success":true'; then
        echo "✅ User berhasil dihapus!"
    else
        echo "❌ Gagal menghapus user"
        echo "Response: $response"
    fi
}

# Main loop
while true; do
    show_menu
    read -p "Pilih menu (1-6): " choice
    
    case $choice in
        1)
            init_default_users
            ;;
        2)
            list_users
            ;;
        3)
            update_user
            ;;
        4)
            create_user
            ;;
        5)
            delete_user
            ;;
        6)
            echo "👋 Terima kasih!"
            exit 0
            ;;
        *)
            echo "❌ Pilihan tidak valid"
            ;;
    esac
    
    echo ""
    read -p "Tekan Enter untuk melanjutkan..."
done

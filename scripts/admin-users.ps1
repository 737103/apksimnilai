# Script PowerShell untuk mengubah username dan password login aplikasi Simnilai
# Pastikan server aplikasi sudah berjalan di http://localhost:8080

Write-Host "🔐 Script Admin - Ubah Kredensial Login Simnilai" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Fungsi untuk menampilkan menu
function Show-Menu {
    Write-Host ""
    Write-Host "Pilih operasi yang ingin dilakukan:" -ForegroundColor Yellow
    Write-Host "1. Inisialisasi user default"
    Write-Host "2. Lihat daftar user"
    Write-Host "3. Ubah username dan password"
    Write-Host "4. Tambah user baru"
    Write-Host "5. Hapus user"
    Write-Host "6. Keluar"
    Write-Host ""
}

# Fungsi untuk inisialisasi user default
function Initialize-DefaultUsers {
    Write-Host "🔄 Menginisialisasi user default..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8080/api/users/init" -Method POST -ContentType "application/json"
        
        if ($response.success) {
            Write-Host "✅ User default berhasil diinisialisasi!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Kredensial default:" -ForegroundColor Cyan
            Write-Host "- Username: admin | Password: admin123 | Role: admin"
            Write-Host "- Username: guru | Password: guru123 | Role: teacher"
            Write-Host "- Username: dalle | Password: asrahabu | Role: user"
        } else {
            Write-Host "❌ Gagal menginisialisasi user default" -ForegroundColor Red
            Write-Host "Response: $($response | ConvertTo-Json)"
        }
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Fungsi untuk melihat daftar user
function Get-Users {
    Write-Host "📋 Daftar User:" -ForegroundColor Cyan
    Write-Host "==============="
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8080/api/users" -Method GET
        
        if ($response.success) {
            foreach ($user in $response.users) {
                Write-Host "Username: $($user.username) | Role: $($user.role) | Dibuat: $($user.created_at)"
            }
        } else {
            Write-Host "❌ Gagal mengambil daftar user" -ForegroundColor Red
            Write-Host "Response: $($response | ConvertTo-Json)"
        }
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Fungsi untuk mengubah user
function Update-User {
    Write-Host ""
    $oldUsername = Read-Host "Masukkan username yang akan diubah"
    
    if ([string]::IsNullOrWhiteSpace($oldUsername)) {
        Write-Host "❌ Username tidak boleh kosong" -ForegroundColor Red
        return
    }
    
    $newUsername = Read-Host "Masukkan username baru (kosongkan jika tidak ingin mengubah)"
    $newPassword = Read-Host "Masukkan password baru (kosongkan jika tidak ingin mengubah)" -AsSecureString
    $newRole = Read-Host "Masukkan role baru (admin/teacher/user, kosongkan jika tidak ingin mengubah)"
    
    # Buat hashtable untuk payload
    $payload = @{
        username = $oldUsername
    }
    
    if (![string]::IsNullOrWhiteSpace($newUsername)) {
        $payload.new_username = $newUsername
    }
    
    if (![string]::IsNullOrWhiteSpace($newPassword)) {
        $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($newPassword))
        $payload.password = $plainPassword
    }
    
    if (![string]::IsNullOrWhiteSpace($newRole)) {
        $payload.role = $newRole
    }
    
    Write-Host "🔄 Mengubah user..." -ForegroundColor Yellow
    
    try {
        $jsonPayload = $payload | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "http://localhost:8080/api/users/upsert" -Method POST -Body $jsonPayload -ContentType "application/json"
        
        if ($response.success) {
            Write-Host "✅ User berhasil diubah!" -ForegroundColor Green
        } else {
            Write-Host "❌ Gagal mengubah user" -ForegroundColor Red
            Write-Host "Response: $($response | ConvertTo-Json)"
        }
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Fungsi untuk menambah user baru
function New-User {
    Write-Host ""
    $username = Read-Host "Masukkan username baru"
    $password = Read-Host "Masukkan password" -AsSecureString
    $role = Read-Host "Masukkan role (admin/teacher/user)"
    
    if ([string]::IsNullOrWhiteSpace($username)) {
        Write-Host "❌ Username tidak boleh kosong" -ForegroundColor Red
        return
    }
    
    $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))
    
    if ([string]::IsNullOrWhiteSpace($plainPassword)) {
        Write-Host "❌ Password tidak boleh kosong" -ForegroundColor Red
        return
    }
    
    $payload = @{
        username = $username
        password = $plainPassword
        role = if ([string]::IsNullOrWhiteSpace($role)) { "user" } else { $role }
    }
    
    Write-Host "🔄 Membuat user baru..." -ForegroundColor Yellow
    
    try {
        $jsonPayload = $payload | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "http://localhost:8080/api/users/upsert" -Method POST -Body $jsonPayload -ContentType "application/json"
        
        if ($response.success) {
            Write-Host "✅ User baru berhasil dibuat!" -ForegroundColor Green
        } else {
            Write-Host "❌ Gagal membuat user baru" -ForegroundColor Red
            Write-Host "Response: $($response | ConvertTo-Json)"
        }
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Fungsi untuk menghapus user
function Remove-User {
    Write-Host ""
    $username = Read-Host "Masukkan username yang akan dihapus"
    
    if ([string]::IsNullOrWhiteSpace($username)) {
        Write-Host "❌ Username tidak boleh kosong" -ForegroundColor Red
        return
    }
    
    $payload = @{
        username = $username
    }
    
    Write-Host "🔄 Menghapus user..." -ForegroundColor Yellow
    
    try {
        $jsonPayload = $payload | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "http://localhost:8080/api/users/delete" -Method POST -Body $jsonPayload -ContentType "application/json"
        
        if ($response.success) {
            Write-Host "✅ User berhasil dihapus!" -ForegroundColor Green
        } else {
            Write-Host "❌ Gagal menghapus user" -ForegroundColor Red
            Write-Host "Response: $($response | ConvertTo-Json)"
        }
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Main loop
while ($true) {
    Show-Menu
    $choice = Read-Host "Pilih menu (1-6)"
    
    switch ($choice) {
        "1" {
            Initialize-DefaultUsers
        }
        "2" {
            Get-Users
        }
        "3" {
            Update-User
        }
        "4" {
            New-User
        }
        "5" {
            Remove-User
        }
        "6" {
            Write-Host "👋 Terima kasih!" -ForegroundColor Green
            exit 0
        }
        default {
            Write-Host "❌ Pilihan tidak valid" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Read-Host "Tekan Enter untuk melanjutkan"
}

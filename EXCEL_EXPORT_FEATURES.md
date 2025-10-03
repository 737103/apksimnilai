# Fitur Download Excel - Kelola Laporan Siswa

## 🎯 Overview

Menu **Kelola Laporan Siswa** telah dilengkapi dengan fitur download data dalam format Excel (.xlsx) untuk semua data yang tersimpan dalam sistem SIPS.

## 📊 Fitur yang Tersedia

### 1. **Download Semua Data**
- **Fungsi**: Download semua data (siswa, nilai, kehadiran) dalam satu file Excel dengan multiple sheets
- **Format**: `Laporan_SIPS_YYYY-MM-DD.xlsx`
- **Sheets**: 
  - Data Siswa
  - Data Nilai  
  - Data Kehadiran
  - Ringkasan (statistik)

### 2. **Download Data Siswa**
- **Fungsi**: Download data siswa dalam format Excel
- **Format**: `Data_Siswa_YYYY-MM-DD.xlsx`
- **Kolom**: Nama Lengkap, NIK, NISN, NIS, Tempat Lahir, Tanggal Lahir, Jenis Kelamin, Agama, Alamat Domisili, Nama Ayah, Nama Ibu, Pekerjaan Orang Tua, Jumlah Saudara, Alamat Orang Tua, Asal Sekolah, Status Siswa, Keterangan, dll.

### 3. **Download Data Nilai**
- **Fungsi**: Download data nilai siswa dalam format Excel
- **Format**: `Data_Nilai_YYYY-MM-DD.xlsx`
- **Kolom**: Nama Siswa, NIK, NISN, NIS, Mata Pelajaran, Kompetensi, Nilai, Keterangan, Tanggal Input

### 4. **Download Data Kehadiran**
- **Fungsi**: Download data kehadiran siswa dalam format Excel
- **Format**: `Data_Kehadiran_YYYY-MM-DD.xlsx`
- **Kolom**: Nama Siswa, NIK, NISN, NIS, Mata Pelajaran, Hadir, Alpa, Sakit, Izin, Total Pertemuan, Persentase Kehadiran, Tanggal Input

## 🔍 Fitur Filter & Pencarian

### Pencarian
- **Fungsi**: Cari berdasarkan nama, NIK, NISN, atau NIS
- **Real-time**: Hasil pencarian update secara real-time
- **Scope**: Mencari di semua data (siswa, nilai, kehadiran)

### Filter Status Siswa
- **Semua Status**: Tampilkan semua siswa
- **Aktif**: Hanya siswa dengan status "Aktif"
- **Meninggal**: Hanya siswa dengan status "Meninggal"
- **Pindahan**: Hanya siswa dengan status "Pindahan"
- **Pindah Sekolah**: Hanya siswa dengan status "Pindah Sekolah"

### Filter Mata Pelajaran
- **Semua Mata Pelajaran**: Tampilkan semua data
- **Spesifik**: Filter berdasarkan mata pelajaran tertentu
- **Auto-populate**: Daftar mata pelajaran diambil dari data nilai yang ada

## 📈 Statistik Real-time

### Overview Cards
- **Total Siswa**: Jumlah total siswa terdaftar
- **Total Nilai**: Jumlah record nilai
- **Record Kehadiran**: Jumlah record kehadiran
- **Rata-rata Nilai**: Rata-rata nilai semua siswa

### Dynamic Counters
- **Siswa Ditemukan**: Jumlah siswa sesuai filter
- **Nilai Ditemukan**: Jumlah nilai sesuai filter
- **Record Ditemukan**: Jumlah record kehadiran sesuai filter

## 👁️ Preview Data

### Preview Tables
- **Data Siswa**: Tabel preview dengan nama, NIK, status
- **Data Nilai**: Tabel preview dengan nama, mata pelajaran, nilai
- **Data Kehadiran**: Tabel preview dengan nama, mata pelajaran, persentase
- **Limit**: Menampilkan 10 record pertama + info jumlah total

## 🎨 User Interface

### Layout
- **Responsive Design**: Mobile dan desktop friendly
- **Card-based Layout**: Organisasi yang rapi
- **Grid System**: Layout yang konsisten

### Visual Elements
- **Icons**: Icon yang sesuai untuk setiap fitur
- **Color Coding**: Warna berbeda untuk setiap jenis data
- **Loading States**: Indikator loading saat export
- **Toast Notifications**: Feedback untuk semua operasi

### Interactive Elements
- **Search Input**: Pencarian real-time
- **Select Dropdowns**: Filter yang mudah digunakan
- **Export Buttons**: Tombol download yang jelas
- **Preview Tables**: Tabel yang informatif

## 🛠️ Technical Features

### Excel Generation
- **Library**: Menggunakan xlsx library
- **Format**: .xlsx (Excel 2007+)
- **Encoding**: UTF-8 untuk support karakter Indonesia
- **Column Widths**: Auto-sizing untuk readability

### Data Processing
- **Real-time Filtering**: Filter data tanpa reload
- **Memory Efficient**: Menggunakan useMemo untuk optimasi
- **Error Handling**: Try-catch untuk semua operasi
- **Type Safety**: Full TypeScript support

### File Operations
- **Auto Download**: File langsung download tanpa server
- **Filename**: Nama file dengan timestamp
- **Multiple Sheets**: Support multiple sheets dalam satu file
- **Data Validation**: Validasi data sebelum export

## 📋 Cara Penggunaan

### 1. Akses Menu
1. Login ke aplikasi SIPS
2. Klik menu "Kelola Laporan Siswa"
3. Halaman laporan akan terbuka

### 2. Filter Data
1. Gunakan search box untuk mencari data spesifik
2. Pilih status siswa dari dropdown
3. Pilih mata pelajaran dari dropdown
4. Data akan ter-filter secara real-time

### 3. Download Data
1. **Download Semua**: Klik tombol "Download Semua Data"
2. **Download Spesifik**: 
   - Klik "Download Excel" pada card Data Siswa
   - Klik "Download Excel" pada card Data Nilai
   - Klik "Download Excel" pada card Data Kehadiran

### 4. Preview Data
1. Lihat preview data di tabel bawah
2. Pastikan data yang akan di-download sudah sesuai
3. Gunakan filter untuk mempersempit data

## ⚠️ Catatan Penting

### Format File
- **Excel Version**: File kompatibel dengan Excel 2007+
- **Encoding**: UTF-8 untuk karakter Indonesia
- **File Size**: Tergantung jumlah data

### Performance
- **Large Data**: Untuk data besar, export mungkin membutuhkan waktu
- **Memory**: Browser membutuhkan memory cukup untuk data besar
- **Filter**: Gunakan filter untuk mengurangi ukuran file

### Browser Support
- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **JavaScript**: Harus enable JavaScript
- **Download**: Browser harus allow download

## 🎯 Status Fitur

- ✅ **Excel Export**: Fully functional
- ✅ **Filter & Search**: Fully functional
- ✅ **Preview Data**: Fully functional
- ✅ **Statistics**: Fully functional
- ✅ **Responsive Design**: Fully functional
- ✅ **Error Handling**: Fully functional
- ✅ **Type Safety**: Fully functional

## 🚀 Keunggulan

1. **User Friendly**: Interface yang mudah digunakan
2. **Flexible**: Filter dan pencarian yang fleksibel
3. **Comprehensive**: Semua data bisa di-export
4. **Professional**: Format Excel yang rapi dan profesional
5. **Fast**: Export yang cepat dan efisien
6. **Safe**: Error handling yang baik
7. **Responsive**: Bekerja di semua device

**Fitur download Excel telah 100% fungsional dan siap digunakan!** 🎉

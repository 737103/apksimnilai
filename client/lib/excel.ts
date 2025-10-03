import * as XLSX from 'xlsx';
import { Student, Grade, Attendance } from './data';

// Utility functions for Excel export
export class ExcelExporter {
  static exportStudents(students: Student[], filename?: string) {
    const data = students.map(student => ({
      'Nama Lengkap': student.namaLengkap,
      'NIK': student.nik,
      'NISN': student.nisn,
      'NIS': student.nis,
      'Tempat Lahir': student.tempatLahir,
      'Tanggal Lahir': student.tanggalLahir,
      'Jenis Kelamin': student.jenisKelamin,
      'Agama': student.agama,
      'Alamat Domisili': student.alamatDomisili,
      'Nama Ayah': student.namaAyah,
      'Nama Ibu': student.namaIbu,
      'Pekerjaan Orang Tua': student.pekerjaanOrtu,
      'Pekerjaan Lainnya': student.pekerjaanOrtuLain || '',
      'Jumlah Saudara': student.jumlahSaudara,
      'Alamat Orang Tua': student.alamatOrtu,
      'Asal Sekolah': student.asalSekolah,
      'Status Siswa': student.statusSiswa,
      'Keterangan': student.keterangan.join(', '),
      'Keterangan Lainnya': student.keteranganLain || '',
      'Tanggal Dibuat': new Date(student.createdAt).toLocaleDateString('id-ID'),
      'Tanggal Diperbarui': new Date(student.updatedAt).toLocaleDateString('id-ID')
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Siswa');

    // Set column widths
    const colWidths = [
      { wch: 25 }, // Nama Lengkap
      { wch: 16 }, // NIK
      { wch: 12 }, // NISN
      { wch: 12 }, // NIS
      { wch: 15 }, // Tempat Lahir
      { wch: 12 }, // Tanggal Lahir
      { wch: 12 }, // Jenis Kelamin
      { wch: 10 }, // Agama
      { wch: 30 }, // Alamat Domisili
      { wch: 20 }, // Nama Ayah
      { wch: 20 }, // Nama Ibu
      { wch: 20 }, // Pekerjaan Orang Tua
      { wch: 20 }, // Pekerjaan Lainnya
      { wch: 12 }, // Jumlah Saudara
      { wch: 30 }, // Alamat Orang Tua
      { wch: 20 }, // Asal Sekolah
      { wch: 12 }, // Status Siswa
      { wch: 30 }, // Keterangan
      { wch: 20 }, // Keterangan Lainnya
      { wch: 12 }, // Tanggal Dibuat
      { wch: 12 }  // Tanggal Diperbarui
    ];
    worksheet['!cols'] = colWidths;

    const fileName = filename || `Data_Siswa_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  static exportGrades(grades: Grade[], filename?: string) {
    const data = grades.map(grade => ({
      'Nama Siswa': grade.namaLengkap,
      'NIK': grade.nik,
      'NISN': grade.nisn,
      'NIS': grade.nis,
      'Kelas': grade.kelas || 'VII',
      'Tahun Ajaran': grade.tahunAjaran || '2024/2025',
      'Semester': grade.semester || 'Ganjil',
      'Mata Pelajaran': grade.mataPelajaran === 'Lainnya' ? grade.mataPelajaranLain : grade.mataPelajaran,
      'Kompetensi': grade.kompetensi.join('; '),
      'Nilai': grade.nilai,
      'Keterangan': grade.keterangan || '',
      'Tanggal Input': new Date(grade.tanggal).toLocaleDateString('id-ID'),
      'Tanggal Dibuat': new Date(grade.createdAt).toLocaleDateString('id-ID')
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Nilai');

    // Set column widths
    const colWidths = [
      { wch: 25 }, // Nama Siswa
      { wch: 16 }, // NIK
      { wch: 12 }, // NISN
      { wch: 12 }, // NIS
      { wch: 20 }, // Mata Pelajaran
      { wch: 40 }, // Kompetensi
      { wch: 8 },  // Nilai
      { wch: 30 }, // Keterangan
      { wch: 12 }, // Tanggal Input
      { wch: 12 }  // Tanggal Dibuat
    ];
    worksheet['!cols'] = colWidths;

    const fileName = filename || `Data_Nilai_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  static exportAttendance(attendance: Attendance[], filename?: string) {
    const data = attendance.map(att => ({
      'Nama Siswa': att.namaLengkap,
      'NIK': att.nik,
      'NISN': att.nisn,
      'NIS': att.nis,
      'Mata Pelajaran': att.mapel,
      'Hadir': att.hadir,
      'Alpa': att.alpa,
      'Sakit': att.sakit,
      'Izin': att.izin,
      'Total Pertemuan': att.hadir + att.alpa + att.sakit + att.izin,
      'Persentase Kehadiran': `${att.persen.toFixed(2)}%`,
      'Tanggal Input': new Date(att.tanggal).toLocaleDateString('id-ID'),
      'Tanggal Dibuat': new Date(att.createdAt).toLocaleDateString('id-ID')
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Kehadiran');

    // Set column widths
    const colWidths = [
      { wch: 25 }, // Nama Siswa
      { wch: 16 }, // NIK
      { wch: 12 }, // NISN
      { wch: 12 }, // NIS
      { wch: 20 }, // Mata Pelajaran
      { wch: 8 },  // Hadir
      { wch: 8 },  // Alpa
      { wch: 8 },  // Sakit
      { wch: 8 },  // Izin
      { wch: 12 }, // Total Pertemuan
      { wch: 15 }, // Persentase Kehadiran
      { wch: 12 }, // Tanggal Input
      { wch: 12 }  // Tanggal Dibuat
    ];
    worksheet['!cols'] = colWidths;

    const fileName = filename || `Data_Kehadiran_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  static exportAllData(students: Student[], grades: Grade[], attendance: Attendance[], filename?: string) {
    const workbook = XLSX.utils.book_new();

    // Students sheet
    const studentsData = students.map(student => ({
      'Nama Lengkap': student.namaLengkap,
      'NIK': student.nik,
      'NISN': student.nisn,
      'NIS': student.nis,
      'Tempat Lahir': student.tempatLahir,
      'Tanggal Lahir': student.tanggalLahir,
      'Jenis Kelamin': student.jenisKelamin,
      'Agama': student.agama,
      'Alamat Domisili': student.alamatDomisili,
      'Nama Ayah': student.namaAyah,
      'Nama Ibu': student.namaIbu,
      'Pekerjaan Orang Tua': student.pekerjaanOrtu,
      'Pekerjaan Lainnya': student.pekerjaanOrtuLain || '',
      'Jumlah Saudara': student.jumlahSaudara,
      'Alamat Orang Tua': student.alamatOrtu,
      'Asal Sekolah': student.asalSekolah,
      'Status Siswa': student.statusSiswa,
      'Keterangan': student.keterangan.join(', '),
      'Keterangan Lainnya': student.keteranganLain || ''
    }));

    const studentsSheet = XLSX.utils.json_to_sheet(studentsData);
    XLSX.utils.book_append_sheet(workbook, studentsSheet, 'Data Siswa');

    // Grades sheet
    const gradesData = grades.map(grade => ({
      'Nama Siswa': grade.namaLengkap,
      'NIK': grade.nik,
      'NISN': grade.nisn,
      'NIS': grade.nis,
      'Kelas': grade.kelas || 'VII',
      'Tahun Ajaran': grade.tahunAjaran || '2024/2025',
      'Semester': grade.semester || 'Ganjil',
      'Mata Pelajaran': grade.mataPelajaran === 'Lainnya' ? grade.mataPelajaranLain : grade.mataPelajaran,
      'Kompetensi': grade.kompetensi.join('; '),
      'Nilai': grade.nilai,
      'Keterangan': grade.keterangan || '',
      'Tanggal Input': new Date(grade.tanggal).toLocaleDateString('id-ID')
    }));

    const gradesSheet = XLSX.utils.json_to_sheet(gradesData);
    XLSX.utils.book_append_sheet(workbook, gradesSheet, 'Data Nilai');

    // Attendance sheet
    const attendanceData = attendance.map(att => ({
      'Nama Siswa': att.namaLengkap,
      'NIK': att.nik,
      'NISN': att.nisn,
      'NIS': att.nis,
      'Mata Pelajaran': att.mapel,
      'Hadir': att.hadir,
      'Alpa': att.alpa,
      'Sakit': att.sakit,
      'Izin': att.izin,
      'Total Pertemuan': att.hadir + att.alpa + att.sakit + att.izin,
      'Persentase Kehadiran': `${att.persen.toFixed(2)}%`,
      'Tanggal Input': new Date(att.tanggal).toLocaleDateString('id-ID')
    }));

    const attendanceSheet = XLSX.utils.json_to_sheet(attendanceData);
    XLSX.utils.book_append_sheet(workbook, attendanceSheet, 'Data Kehadiran');

    // Summary sheet
    const summaryData = [
      { 'Kategori': 'Total Siswa', 'Jumlah': students.length },
      { 'Kategori': 'Siswa Aktif', 'Jumlah': students.filter(s => s.statusSiswa === 'Aktif').length },
      { 'Kategori': 'Total Nilai', 'Jumlah': grades.length },
      { 'Kategori': 'Record Kehadiran', 'Jumlah': attendance.length },
      { 'Kategori': 'Rata-rata Nilai', 'Jumlah': grades.length > 0 ? (grades.reduce((sum, g) => sum + g.nilai, 0) / grades.length).toFixed(2) : '0' },
      { 'Kategori': 'Rata-rata Kehadiran', 'Jumlah': attendance.length > 0 ? `${(attendance.reduce((sum, a) => sum + a.persen, 0) / attendance.length).toFixed(2)}%` : '0%' }
    ];

    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan');

    const fileName = filename || `Laporan_SIPS_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }
}

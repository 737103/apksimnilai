/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

// Auth
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: {
    id: string;
    username: string;
    role: string;
  };
  error?: string;
}

export interface SyncPayloadStudent {
  id: string;
  namaLengkap: string;
  nik?: string;
  nisn?: string;
  nis?: string;
  tempatLahir?: string;
  tanggalLahir?: string;
  jenisKelamin?: "Laki-laki" | "Perempuan" | string;
  agama?: string;
  alamatDomisili?: string;
  noTeleponSiswa?: string;
  namaAyah?: string;
  namaIbu?: string;
  pekerjaanAyah?: string;
  pekerjaanAyahLain?: string;
  pekerjaanIbu?: string;
  pekerjaanIbuLain?: string;
  anakKe?: number;
  jumlahSaudara?: number;
  diterimaDiKelas?: string;
  diterimaPadaTanggal?: string;
  alamatOrtu?: string;
  noTeleponOrtu?: string;
  namaWali?: string;
  alamatWali?: string;
  noTeleponWali?: string;
  pekerjaanWali?: string;
  pekerjaanWaliLain?: string;
  asalSekolah?: string;
  statusSiswa?: string;
  keterangan?: string[];
  fotoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SyncPayloadGrade {
  id: string;
  studentId: string;
  namaLengkap: string;
  nik?: string;
  nisn?: string;
  nis?: string;
  mataPelajaran: string;
  mataPelajaranLain?: string;
  kelas: string;
  tahunAjaran: string;
  semester: string;
  kompetensi: string[];
  nilai: number;
  keterangan?: string;
  tanggal: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SyncPayloadAttendance {
  id: string;
  studentId: string;
  namaLengkap: string;
  nik?: string;
  nisn?: string;
  nis?: string;
  mapel: string;
  kelas: string;
  tahunAjaran: string;
  semester: string;
  hadir: number;
  alpa: number;
  sakit: number;
  izin: number;
  persen?: number;
  tanggal: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SyncRequest {
  students: SyncPayloadStudent[];
  grades: SyncPayloadGrade[];
  attendance: SyncPayloadAttendance[];
}

export interface SyncResponse {
  success: boolean;
  inserted: {
    students: number;
    grades: number;
    attendance: number;
  };
  upsertedStudents: number;
  errors?: string[];
}

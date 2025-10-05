// Data management utilities for SIPS application

export interface Student {
  id: string;
  namaLengkap: string;
  nik: string;
  nisn: string;
  nis: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: "Laki-laki" | "Perempuan";
  agama: string;
  alamatDomisili: string;
  noTeleponSiswa: string;
  namaAyah: string;
  namaIbu: string;
  pekerjaanAyah: string;
  pekerjaanAyahLain?: string;
  pekerjaanIbu: string;
  pekerjaanIbuLain?: string;
  anakKe: number;
  jumlahSaudara: number;
  diterimaDiKelas: string;
  diterimaPadaTanggal: string;
  alamatOrtu: string;
  noTeleponOrtu: string;
  namaWali?: string;
  alamatWali?: string;
  noTeleponWali?: string;
  pekerjaanWali?: string;
  pekerjaanWaliLain?: string;
  asalSekolah: string;
  statusSiswa: string;
  keterangan: string[];
  keteranganLain?: string;
  fotoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Grade {
  id: string;
  studentId: string;
  namaLengkap: string;
  nik: string;
  nisn: string;
  nis: string;
  mataPelajaran: string;
  mataPelajaranLain?: string;
  kelas: string;
  tahunAjaran: string;
  semester: string;
  kompetensi: string[];
  nilai: number;
  keterangan?: string;
  tanggal: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  namaLengkap: string;
  nik: string;
  nisn: string;
  nis: string;
  mapel: string;
  kelas: string;
  tahunAjaran: string;
  semester: string;
  hadir: number;
  alpa: number;
  sakit: number;
  izin: number;
  persen: number;
  tanggal: string;
  createdAt: string;
  updatedAt: string;
}

// Generic data manager
class DataManager<T> {
  private key: string;
  private data: T[] = [];

  constructor(key: string) {
    this.key = key;
    this.load();
  }

  private load(): void {
    try {
      const stored = localStorage.getItem(this.key);
      this.data = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error(`Error loading data for ${this.key}:`, error);
      this.data = [];
    }
  }

  private save(): void {
    try {
      localStorage.setItem(this.key, JSON.stringify(this.data));
      // Notify other parts of the app that data has changed
      try {
        const type = this.key === "sips_students" 
          ? "students" 
          : this.key === "sips_grades" 
          ? "grades" 
          : this.key === "sips_attendance" 
          ? "attendance" 
          : "unknown";
        window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type } }));
      } catch {
        // no-op if window is unavailable
      }
    } catch (error) {
      console.error(`Error saving data for ${this.key}:`, error);
      throw new Error("Gagal menyimpan data");
    }
  }

  getAll(): T[] {
    // Always reload from localStorage to reflect latest cross-page updates
    this.load();
    return [...this.data];
  }

  getById(id: string): T | undefined {
    // Ensure the freshest snapshot before lookup
    this.load();
    return this.data.find((item: any) => item.id === id);
  }

  create(item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): T {
    const now = new Date().toISOString();
    const newItem = {
      ...item,
      id: crypto.randomUUID?.() || String(Date.now()),
      createdAt: now,
      updatedAt: now,
    } as T;

    this.data.unshift(newItem);
    this.save();
    return newItem;
  }

  update(id: string, updates: Partial<T>): T | null {
    const index = this.data.findIndex((item: any) => item.id === id);
    if (index === -1) return null;

    const updatedItem = {
      ...this.data[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    } as T;

    this.data[index] = updatedItem;
    this.save();
    return updatedItem;
  }

  delete(id: string): boolean {
    const index = this.data.findIndex((item: any) => item.id === id);
    if (index === -1) return false;

    this.data.splice(index, 1);
    this.save();
    return true;
  }

  search(query: string, fields: (keyof T)[]): T[] {
    // Reload to ensure search uses latest data
    this.load();
    if (!query.trim()) return this.data;

    const q = query.toLowerCase();
    return this.data.filter((item: any) =>
      fields.some(field => {
        const value = item[field];
        return String(value || "").toLowerCase().includes(q);
      })
    );
  }

  export(): string {
    this.load();
    return JSON.stringify(this.data, null, 2);
  }

  import(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        this.data = parsed;
        this.save();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  clear(): void {
    this.data = [];
    this.save();
  }

  get count(): number {
    this.load();
    return this.data.length;
  }
}

// Export data managers
export const studentManager = new DataManager<Student>("sips_students");
export const gradeManager = new DataManager<Grade>("sips_grades");
export const attendanceManager = new DataManager<Attendance>("sips_attendance");

// Utility functions
export function exportAllData(): string {
  return JSON.stringify({
    students: studentManager.getAll(),
    grades: gradeManager.getAll(),
    attendance: attendanceManager.getAll(),
    exportedAt: new Date().toISOString(),
  }, null, 2);
}

export function importAllData(data: string): boolean {
  try {
    const parsed = JSON.parse(data);

    // Full backup format
    if (parsed && (parsed.students || parsed.grades || parsed.attendance)) {
      if (parsed.students) studentManager.import(JSON.stringify(parsed.students));
      if (parsed.grades) gradeManager.import(JSON.stringify(parsed.grades));
      if (parsed.attendance) attendanceManager.import(JSON.stringify(parsed.attendance));
      return true;
    }

    // Array category-only import
    if (Array.isArray(parsed)) {
      const arr = parsed as any[];
      // Heuristic detection
      const sample = arr[0] || {};
      if (sample && ("namaLengkap" in sample) && ("nik" in sample) && ("nisn" in sample)) {
        return studentManager.import(JSON.stringify(arr));
      }
      if (sample && ("nilai" in sample) && ("mataPelajaran" in sample || "mataPelajaranLain" in sample)) {
        return gradeManager.import(JSON.stringify(arr));
      }
      if (sample && ("hadir" in sample) && ("alpa" in sample) && ("sakit" in sample) && ("izin" in sample)) {
        return attendanceManager.import(JSON.stringify(arr));
      }
      // Unknown array format
      return false;
    }

    return false;
  } catch {
    return false;
  }
}

export function getStatistics() {
  const students = studentManager.getAll();
  const grades = gradeManager.getAll();
  const attendance = attendanceManager.getAll();

  const activeStudents = students.filter(s => s.statusSiswa === "Aktif").length;
  
  const averageGrade = grades.length > 0 
    ? grades.reduce((sum, g) => sum + g.nilai, 0) / grades.length 
    : 0;

  const averageAttendance = attendance.length > 0
    ? attendance.reduce((sum, a) => sum + a.persen, 0) / attendance.length
    : 0;

  return {
    totalStudents: students.length,
    activeStudents,
    totalGrades: grades.length,
    averageGrade: Math.round(averageGrade * 100) / 100,
    totalAttendanceRecords: attendance.length,
    averageAttendance: Math.round(averageAttendance * 100) / 100,
  };
}

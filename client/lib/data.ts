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

  private async syncToDatabase(item: any, operation: 'create' | 'update' | 'delete'): Promise<void> {
    try {
      if (this.key === "sips_students") {
        if (operation === 'delete') {
          await fetch('/api/students/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
          });
        } else {
          await fetch('/api/students/upsert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
          });
        }
      }
      // Add similar logic for grades and attendance if needed
    } catch (error) {
      console.error(`Error syncing to database:`, error);
      // Don't throw error to prevent breaking the app if sync fails
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
    
    // Sync to database asynchronously
    this.syncToDatabase(newItem, 'create');
    
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
    
    // Sync to database asynchronously
    this.syncToDatabase(updatedItem, 'update');
    
    return updatedItem;
  }

  delete(id: string): boolean {
    const index = this.data.findIndex((item: any) => item.id === id);
    if (index === -1) return false;

    const deletedItem = this.data[index];
    this.data.splice(index, 1);
    this.save();
    
    // Sync to database asynchronously
    this.syncToDatabase(deletedItem, 'delete');
    
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

// Function to sync all existing data to database
export async function syncAllDataToDatabase(): Promise<void> {
  try {
    const students = studentManager.getAll();
    
    // Sync all students to database
    for (const student of students) {
      try {
        await fetch('/api/students/upsert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(student)
        });
      } catch (error) {
        console.error(`Error syncing student ${student.namaLengkap}:`, error);
      }
    }
    
    console.log(`Synced ${students.length} students to database`);
  } catch (error) {
    console.error('Error syncing data to database:', error);
  }
}

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

// Function to load students from database
export async function loadStudentsFromDatabase(): Promise<Student[]> {
  try {
    const response = await fetch('/api/students');
    const result = await response.json();
    
    if (result.success && result.data) {
      // Update localStorage with data from database
      localStorage.setItem("sips_students", JSON.stringify(result.data));
      return result.data;
    }
    return [];
  } catch (error) {
    console.error('Error loading students from database:', error);
    return [];
  }
}

export function getStatistics() {
  const students = studentManager.getAll();
  const grades = gradeManager.getAll();
  const attendance = attendanceManager.getAll();

  const activeStudents = students.filter(s => s.statusSiswa === "Aktif").length;
  
  // Gender breakdown
  const maleStudents = students.filter(s => s.jenisKelamin === "Laki-laki").length;
  const femaleStudents = students.filter(s => s.jenisKelamin === "Perempuan").length;
  
  
  const averageGrade = grades.length > 0 
    ? grades.reduce((sum, g) => sum + g.nilai, 0) / grades.length 
    : 0;

  const averageAttendance = attendance.length > 0
    ? attendance.reduce((sum, a) => sum + a.persen, 0) / attendance.length
    : 0;

  return {
    totalStudents: students.length,
    activeStudents,
    maleStudents,
    femaleStudents,
    totalGrades: grades.length,
    averageGrade: Math.round(averageGrade * 100) / 100,
    totalAttendanceRecords: attendance.length,
    averageAttendance: Math.round(averageAttendance * 100) / 100,
  };
}

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Download, 
  FileSpreadsheet, 
  Users2, 
  ClipboardList, 
  CalendarCheck2,
  Search,
  Filter,
  BarChart3,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { 
  studentManager, 
  gradeManager, 
  attendanceManager,
  getStatistics,
  Student,
  Grade,
  Attendance
} from "@/lib/data";
import { ExcelExporter } from "@/lib/excel";

export default function ReportPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Get all data with refresh capability
  const students = useMemo(() => studentManager.getAll(), [refreshKey]);
  const grades = useMemo(() => gradeManager.getAll(), [refreshKey]);
  const attendance = useMemo(() => attendanceManager.getAll(), [refreshKey]);
  const stats = useMemo(() => getStatistics(), [refreshKey]);

  // Auto-refresh data when component mounts or when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setRefreshKey(prev => prev + 1);
      setLastUpdated(new Date());
    };

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events that might be dispatched when data changes
    window.addEventListener('dataUpdated', handleStorageChange);

    // Initial refresh
    handleStorageChange();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('dataUpdated', handleStorageChange);
    };
  }, []);

  // Manual refresh function
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    setLastUpdated(new Date());
    toast.success("Data telah diperbarui");
  };

  // Get unique subjects from grades
  const subjects = useMemo(() => {
    const subjectSet = new Set<string>();
    grades.forEach(grade => {
      const subject = grade.mataPelajaran === 'Lainnya' ? grade.mataPelajaranLain : grade.mataPelajaran;
      if (subject) subjectSet.add(subject);
    });
    return Array.from(subjectSet);
  }, [grades, refreshKey]);

  // Get unique classes from students
  const classes = useMemo(() => {
    const classSet = new Set<string>();
    students.forEach(student => {
      if (student.diterimaDiKelas) classSet.add(student.diterimaDiKelas);
    });
    return Array.from(classSet).sort();
  }, [students, refreshKey]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = !searchTerm || 
        student.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.nik.includes(searchTerm) ||
        student.nisn.includes(searchTerm) ||
        student.nis.includes(searchTerm) ||
        student.noTeleponSiswa.includes(searchTerm) ||
        student.noTeleponOrtu.includes(searchTerm) ||
        (student.namaWali && student.namaWali.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === "all" || student.statusSiswa === statusFilter;
      const matchesClass = classFilter === "all" || student.diterimaDiKelas === classFilter;
      
      return matchesSearch && matchesStatus && matchesClass;
    });
  }, [students, searchTerm, statusFilter, classFilter, refreshKey]);

  // Filter grades
  const filteredGrades = useMemo(() => {
    return grades.filter(grade => {
      const matchesSearch = !searchTerm || 
        grade.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grade.nik.includes(searchTerm) ||
        grade.nisn.includes(searchTerm) ||
        grade.nis.includes(searchTerm);
      
      const subject = grade.mataPelajaran === 'Lainnya' ? grade.mataPelajaranLain : grade.mataPelajaran;
      const matchesSubject = subjectFilter === "all" || subject === subjectFilter;
      
      return matchesSearch && matchesSubject;
    });
  }, [grades, searchTerm, subjectFilter, refreshKey]);

  // Filter attendance
  const filteredAttendance = useMemo(() => {
    return attendance.filter(att => {
      const matchesSearch = !searchTerm || 
        att.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
        att.nik.includes(searchTerm) ||
        att.nisn.includes(searchTerm) ||
        att.nis.includes(searchTerm);
      
      const matchesSubject = subjectFilter === "all" || att.mapel === subjectFilter;
      
      return matchesSearch && matchesSubject;
    });
  }, [attendance, searchTerm, subjectFilter, refreshKey]);

  const handleExportStudents = async () => {
    setIsLoading(true);
    try {
      ExcelExporter.exportStudents(filteredStudents);
      toast.success("Data siswa berhasil diekspor ke Excel");
    } catch (error) {
      toast.error("Gagal mengekspor data siswa");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportGrades = async () => {
    setIsLoading(true);
    try {
      ExcelExporter.exportGrades(filteredGrades);
      toast.success("Data nilai berhasil diekspor ke Excel");
    } catch (error) {
      toast.error("Gagal mengekspor data nilai");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportAttendance = async () => {
    setIsLoading(true);
    try {
      ExcelExporter.exportAttendance(filteredAttendance);
      toast.success("Data kehadiran berhasil diekspor ke Excel");
    } catch (error) {
      toast.error("Gagal mengekspor data kehadiran");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportAll = async () => {
    setIsLoading(true);
    try {
      ExcelExporter.exportAllData(students, grades, attendance);
      toast.success("Semua data berhasil diekspor ke Excel");
    } catch (error) {
      toast.error("Gagal mengekspor semua data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Kelola Laporan Siswa</h1>
          <p className="text-muted-foreground">
            Download data siswa, nilai, dan kehadiran dalam format Excel
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Terakhir diperbarui: {lastUpdated.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleRefresh} 
            variant="outline"
            className="w-full md:w-auto"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
          <Button 
            onClick={handleExportAll} 
            disabled={isLoading}
            className="w-full md:w-auto"
          >
            <Download className="mr-2 h-4 w-4" />
            {isLoading ? "Mengekspor..." : "Download Semua Data"}
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users2 className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Siswa</p>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
                <p className="text-xs text-muted-foreground">
                  Aktif: {students.filter(s => s.statusSiswa === 'Aktif').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Nilai</p>
                <p className="text-2xl font-bold">{stats.totalGrades}</p>
                <p className="text-xs text-muted-foreground">
                  Rata-rata: {stats.averageGrade}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CalendarCheck2 className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Record Kehadiran</p>
                <p className="text-2xl font-bold">{stats.totalAttendanceRecords}</p>
                <p className="text-xs text-muted-foreground">
                  Rata-rata: {stats.averageAttendance}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Kelas Tersedia</p>
                <p className="text-2xl font-bold">{classes.length}</p>
                <p className="text-xs text-muted-foreground">
                  {classes.join(', ')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Pencarian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Pencarian</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Cari nama, NIK, NISN, NIS, telepon..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status Siswa</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="Aktif">Aktif</SelectItem>
                  <SelectItem value="Meninggal">Meninggal</SelectItem>
                  <SelectItem value="Pindahan">Pindahan</SelectItem>
                  <SelectItem value="Pindah Sekolah">Pindah Sekolah</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="class">Kelas</Label>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kelas</SelectItem>
                  {classes.map(classItem => (
                    <SelectItem key={classItem} value={classItem}>
                      {classItem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="subject">Mata Pelajaran</Label>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih mata pelajaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Mata Pelajaran</SelectItem>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button 
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setSubjectFilter("all");
                setClassFilter("all");
                toast.success("Filter telah direset");
              }}
              variant="outline"
              className="w-full"
            >
              <Filter className="mr-2 h-4 w-4" />
              Reset Filter
            </Button>
            <Button 
              onClick={() => {
                const activeStudents = students.filter(s => s.statusSiswa === 'Aktif');
                setSearchTerm("");
                setStatusFilter("Aktif");
                setSubjectFilter("all");
                setClassFilter("all");
                toast.success(`Menampilkan ${activeStudents.length} siswa aktif`);
              }}
              variant="outline"
              className="w-full"
            >
              <Users2 className="mr-2 h-4 w-4" />
              Siswa Aktif
            </Button>
            <Button 
              onClick={() => {
                const highGrades = grades.filter(g => g.nilai >= 80);
                setSearchTerm("");
                setStatusFilter("all");
                setSubjectFilter("all");
                setClassFilter("all");
                toast.success(`Menampilkan ${highGrades.length} nilai tinggi (≥80)`);
              }}
              variant="outline"
              className="w-full"
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              Nilai Tinggi
            </Button>
            <Button 
              onClick={() => {
                const goodAttendance = attendance.filter(a => a.persen >= 80);
                setSearchTerm("");
                setStatusFilter("all");
                setSubjectFilter("all");
                setClassFilter("all");
                toast.success(`Menampilkan ${goodAttendance.length} kehadiran baik (≥80%)`);
              }}
              variant="outline"
              className="w-full"
            >
              <CalendarCheck2 className="mr-2 h-4 w-4" />
              Kehadiran Baik
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Ringkasan Detail Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Students Summary */}
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-600 flex items-center gap-2">
                <Users2 className="h-4 w-4" />
                Data Siswa
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Siswa:</span>
                  <span className="font-medium">{students.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Siswa Aktif:</span>
                  <span className="font-medium text-green-600">{students.filter(s => s.statusSiswa === 'Aktif').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pindahan:</span>
                  <span className="font-medium text-orange-600">{students.filter(s => s.statusSiswa === 'Pindahan').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Meninggal:</span>
                  <span className="font-medium text-red-600">{students.filter(s => s.statusSiswa === 'Meninggal').length}</span>
                </div>
              </div>
            </div>

            {/* Grades Summary */}
            <div className="space-y-3">
              <h4 className="font-semibold text-green-600 flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Data Nilai
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Nilai:</span>
                  <span className="font-medium">{grades.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nilai Tinggi (≥80):</span>
                  <span className="font-medium text-green-600">{grades.filter(g => g.nilai >= 80).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nilai Sedang (60-79):</span>
                  <span className="font-medium text-yellow-600">{grades.filter(g => g.nilai >= 60 && g.nilai < 80).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nilai Rendah (&lt;60):</span>
                  <span className="font-medium text-red-600">{grades.filter(g => g.nilai < 60).length}</span>
                </div>
              </div>
            </div>

            {/* Attendance Summary */}
            <div className="space-y-3">
              <h4 className="font-semibold text-orange-600 flex items-center gap-2">
                <CalendarCheck2 className="h-4 w-4" />
                Data Kehadiran
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Record:</span>
                  <span className="font-medium">{attendance.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kehadiran Baik (≥80%):</span>
                  <span className="font-medium text-green-600">{attendance.filter(a => a.persen >= 80).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kehadiran Sedang (60-79%):</span>
                  <span className="font-medium text-yellow-600">{attendance.filter(a => a.persen >= 60 && a.persen < 80).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kehadiran Rendah (&lt;60%):</span>
                  <span className="font-medium text-red-600">{attendance.filter(a => a.persen < 60).length}</span>
                </div>
              </div>
            </div>

            {/* Classes Summary */}
            <div className="space-y-3">
              <h4 className="font-semibold text-purple-600 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Distribusi Kelas
              </h4>
              <div className="space-y-2 text-sm">
                {classes.map(classItem => (
                  <div key={classItem} className="flex justify-between">
                    <span>Kelas {classItem}:</span>
                    <span className="font-medium">{students.filter(s => s.diterimaDiKelas === classItem).length}</span>
                  </div>
                ))}
                {classes.length === 0 && (
                  <div className="text-muted-foreground text-center py-2">
                    Belum ada data kelas
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Students Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users2 className="h-5 w-5" />
              Data Siswa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{filteredStudents.length}</p>
              <p className="text-sm text-muted-foreground">Siswa ditemukan</p>
            </div>
            <div className="space-y-2">
              <Button 
                onClick={handleExportStudents} 
                disabled={isLoading || filteredStudents.length === 0}
                className="w-full"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Download Excel
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                {filteredStudents.length === students.length 
                  ? "Semua data siswa" 
                  : `${filteredStudents.length} siswa (terfilter)`
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Grades Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Data Nilai
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{filteredGrades.length}</p>
              <p className="text-sm text-muted-foreground">Nilai ditemukan</p>
            </div>
            <div className="space-y-2">
              <Button 
                onClick={handleExportGrades} 
                disabled={isLoading || filteredGrades.length === 0}
                className="w-full"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Download Excel
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                {filteredGrades.length === grades.length 
                  ? "Semua data nilai" 
                  : `${filteredGrades.length} nilai (terfilter)`
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck2 className="h-5 w-5" />
              Data Kehadiran
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">{filteredAttendance.length}</p>
              <p className="text-sm text-muted-foreground">Record ditemukan</p>
            </div>
            <div className="space-y-2">
              <Button 
                onClick={handleExportAttendance} 
                disabled={isLoading || filteredAttendance.length === 0}
                className="w-full"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Download Excel
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                {filteredAttendance.length === attendance.length 
                  ? "Semua data kehadiran" 
                  : `${filteredAttendance.length} record (terfilter)`
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Students Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Preview Data Siswa</span>
              <span className="text-sm font-normal text-muted-foreground">
                {filteredStudents.length} dari {students.length} siswa
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Tidak ada data siswa yang ditemukan</p>
                <p className="text-sm">Coba ubah filter atau tambahkan data siswa baru</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>NIK</TableHead>
                      <TableHead>Kelas</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Telepon</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.slice(0, 10).map(student => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.namaLengkap}</TableCell>
                        <TableCell>{student.nik}</TableCell>
                        <TableCell>{student.diterimaDiKelas || '-'}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            student.statusSiswa === 'Aktif' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {student.statusSiswa}
                          </span>
                        </TableCell>
                        <TableCell>{student.noTeleponSiswa || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredStudents.length > 10 && (
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    ... dan {filteredStudents.length - 10} siswa lainnya
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Grades Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Preview Data Nilai</span>
              <span className="text-sm font-normal text-muted-foreground">
                {filteredGrades.length} dari {grades.length} nilai
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredGrades.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Tidak ada data nilai yang ditemukan</p>
                <p className="text-sm">Coba ubah filter atau tambahkan data nilai baru</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Kelas</TableHead>
                      <TableHead>Mapel</TableHead>
                      <TableHead>Nilai</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGrades.slice(0, 10).map(grade => (
                      <TableRow key={grade.id}>
                        <TableCell className="font-medium">{grade.namaLengkap}</TableCell>
                        <TableCell>{grade.kelas || '-'}</TableCell>
                        <TableCell>
                          {grade.mataPelajaran === 'Lainnya' ? grade.mataPelajaranLain : grade.mataPelajaran}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            grade.nilai >= 80 
                              ? 'bg-green-100 text-green-800' 
                              : grade.nilai >= 60 
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {grade.nilai}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredGrades.length > 10 && (
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    ... dan {filteredGrades.length - 10} nilai lainnya
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendance Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Preview Data Kehadiran</span>
              <span className="text-sm font-normal text-muted-foreground">
                {filteredAttendance.length} dari {attendance.length} record
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAttendance.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarCheck2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Tidak ada data kehadiran yang ditemukan</p>
                <p className="text-sm">Coba ubah filter atau tambahkan data kehadiran baru</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Mapel</TableHead>
                      <TableHead>Hadir</TableHead>
                      <TableHead>%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAttendance.slice(0, 10).map(att => (
                      <TableRow key={att.id}>
                        <TableCell className="font-medium">{att.namaLengkap}</TableCell>
                        <TableCell>{att.mapel}</TableCell>
                        <TableCell>{att.hadir}/{att.hadir + att.alpa + att.sakit + att.izin}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            att.persen >= 80 
                              ? 'bg-green-100 text-green-800' 
                              : att.persen >= 60 
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {att.persen.toFixed(1)}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredAttendance.length > 10 && (
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    ... dan {filteredAttendance.length - 10} record lainnya
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

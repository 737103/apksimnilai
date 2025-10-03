import React, { useState, useMemo } from "react";
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
  BarChart3
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
  const [isLoading, setIsLoading] = useState(false);

  // Get all data
  const students = useMemo(() => studentManager.getAll(), []);
  const grades = useMemo(() => gradeManager.getAll(), []);
  const attendance = useMemo(() => attendanceManager.getAll(), []);
  const stats = useMemo(() => getStatistics(), []);

  // Get unique subjects from grades
  const subjects = useMemo(() => {
    const subjectSet = new Set<string>();
    grades.forEach(grade => {
      const subject = grade.mataPelajaran === 'Lainnya' ? grade.mataPelajaranLain : grade.mataPelajaran;
      if (subject) subjectSet.add(subject);
    });
    return Array.from(subjectSet);
  }, [grades]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = !searchTerm || 
        student.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.nik.includes(searchTerm) ||
        student.nisn.includes(searchTerm) ||
        student.nis.includes(searchTerm);
      
      const matchesStatus = statusFilter === "all" || student.statusSiswa === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [students, searchTerm, statusFilter]);

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
  }, [grades, searchTerm, subjectFilter]);

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
  }, [attendance, searchTerm, subjectFilter]);

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
        </div>
        <Button 
          onClick={handleExportAll} 
          disabled={isLoading}
          className="w-full md:w-auto"
        >
          <Download className="mr-2 h-4 w-4" />
          {isLoading ? "Mengekspor..." : "Download Semua Data"}
        </Button>
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
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Rata-rata Nilai</p>
                <p className="text-2xl font-bold">{stats.averageGrade}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Pencarian</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Cari nama, NIK, NISN, NIS..."
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
            <Button 
              onClick={handleExportStudents} 
              disabled={isLoading || filteredStudents.length === 0}
              className="w-full"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Download Excel
            </Button>
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
            <Button 
              onClick={handleExportGrades} 
              disabled={isLoading || filteredGrades.length === 0}
              className="w-full"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Download Excel
            </Button>
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
            <Button 
              onClick={handleExportAttendance} 
              disabled={isLoading || filteredAttendance.length === 0}
              className="w-full"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Download Excel
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Preview Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Students Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Preview Data Siswa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>NIK</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.slice(0, 10).map(student => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.namaLengkap}</TableCell>
                      <TableCell>{student.nik}</TableCell>
                      <TableCell>{student.statusSiswa}</TableCell>
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
          </CardContent>
        </Card>

        {/* Grades Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Preview Data Nilai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Mapel</TableHead>
                    <TableHead>Nilai</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGrades.slice(0, 10).map(grade => (
                    <TableRow key={grade.id}>
                      <TableCell className="font-medium">{grade.namaLengkap}</TableCell>
                      <TableCell>
                        {grade.mataPelajaran === 'Lainnya' ? grade.mataPelajaranLain : grade.mataPelajaran}
                      </TableCell>
                      <TableCell>{grade.nilai}</TableCell>
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
          </CardContent>
        </Card>

        {/* Attendance Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Preview Data Kehadiran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Mapel</TableHead>
                    <TableHead>%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttendance.slice(0, 10).map(att => (
                    <TableRow key={att.id}>
                      <TableCell className="font-medium">{att.namaLengkap}</TableCell>
                      <TableCell>{att.mapel}</TableCell>
                      <TableCell>{att.persen.toFixed(1)}%</TableCell>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

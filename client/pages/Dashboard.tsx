import React, { useState } from "react";
import { useNavigate, Routes, Route, NavLink } from "react-router-dom";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  CalendarCheck2,
  ClipboardList,
  FileSpreadsheet,
  LogOut,
  Users2,
  Pencil,
  Trash2,
  Printer,
  Database,
} from "lucide-react";
import { logout } from "@/lib/auth";
import { generateBiodataWord } from "@/lib/biodata-export";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { DataManager } from "@/components/DataManager";
import { getStatistics } from "@/lib/data";
import ReportPage from "./ReportPage";

const menu = [
  { to: "/dashboard", label: "Statistik", icon: BarChart3, end: true },
  { to: "/dashboard/siswa", label: "Data Siswa", icon: Users2 },
  { to: "/dashboard/nilai", label: "Input Nilai Siswa", icon: ClipboardList },
  {
    to: "/dashboard/kehadiran",
    label: "Input Kehadiran Siswa",
    icon: CalendarCheck2,
  },
  {
    to: "/dashboard/laporan",
    label: "Kelola Laporan Siswa",
    icon: FileSpreadsheet,
  },
  {
    to: "/dashboard/data",
    label: "Manajemen Data",
    icon: Database,
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <SidebarProvider>
      <Sidebar className="bg-sidebar">
        <SidebarHeader className="px-3 py-4">
          <div className="font-extrabold text-lg leading-tight">
            SIPS
            <div className="text-xs font-normal text-muted-foreground">
              SMPN 2 Baraka
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menu.map((m) => (
              <SidebarMenuItem key={m.to}>
                <SidebarMenuButton asChild isActive={false}>
                  <NavLink
                    to={m.to}
                    end={m.end as boolean | undefined}
                    className={({ isActive }) =>
                      isActive ? "data-[active=true]" : undefined
                    }
                  >
                    <m.icon className="shrink-0" />
                    <span>{m.label}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter className="px-3 pb-3">
          <Button variant="secondary" className="w-full" onClick={handleLogout}>
            <LogOut className="mr-2" /> Keluar
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center gap-2 px-4 h-14">
            <SidebarTrigger />
            <div className="font-semibold">
              Sistem Informasi Penilaian Siswa — SMPN 2 Baraka Kab. Enrekang
            </div>
          </div>
        </header>
        <main className="p-4 md:p-6 grid gap-4">
          <Routes>
            <Route index element={<StatistikSection />} />
            <Route path="siswa" element={<DataSiswaForm />} />
            <Route path="nilai" element={<InputNilaiPage />} />
            <Route path="kehadiran" element={<AttendancePage />} />
            <Route path="laporan" element={<ReportPage />} />
            <Route path="data" element={<DataManager />} />
          </Routes>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function StatistikSection() {
  const stats = getStatistics();
  
  // State untuk filter
  const [selectedTahunAjaran, setSelectedTahunAjaran] = React.useState<string>("all");
  const [selectedSemester, setSelectedSemester] = React.useState<string>("all");
  
  // Ambil data nilai dari localStorage
  const grades = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("sips_grades") || "[]");
    } catch {
      return [];
    }
  }, []);

  // Ambil daftar tahun ajaran yang tersedia
  const availableTahunAjaran = React.useMemo(() => {
    const tahunSet = new Set<string>();
    grades.forEach((grade: any) => {
      if (grade.tahunAjaran) {
        tahunSet.add(grade.tahunAjaran);
      }
    });
    return Array.from(tahunSet).sort();
  }, [grades]);

  // Filter data berdasarkan tahun ajaran dan semester
  const filteredGrades = React.useMemo(() => {
    return grades.filter((grade: any) => {
      const tahunMatch = selectedTahunAjaran === "all" || grade.tahunAjaran === selectedTahunAjaran;
      const semesterMatch = selectedSemester === "all" || grade.semester === selectedSemester;
      return tahunMatch && semesterMatch;
    });
  }, [grades, selectedTahunAjaran, selectedSemester]);

  // Hitung rata-rata nilai per bulan berdasarkan data sebenarnya
  const chartData = React.useMemo(() => {
    if (filteredGrades.length === 0) {
      return [
        { bulan: "Jan", nilai: 0 },
        { bulan: "Feb", nilai: 0 },
        { bulan: "Mar", nilai: 0 },
        { bulan: "Apr", nilai: 0 },
        { bulan: "Mei", nilai: 0 },
        { bulan: "Jun", nilai: 0 },
        { bulan: "Jul", nilai: 0 },
        { bulan: "Agu", nilai: 0 },
        { bulan: "Sep", nilai: 0 },
        { bulan: "Okt", nilai: 0 },
        { bulan: "Nov", nilai: 0 },
        { bulan: "Des", nilai: 0 },
      ];
    }

    // Group data per bulan
    const monthlyData: { [key: string]: number[] } = {};
    
    filteredGrades.forEach((grade: any) => {
      const date = new Date(grade.tanggal || grade.createdAt);
      const month = date.getMonth(); // 0-11
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
      const monthName = monthNames[month];
      
      if (!monthlyData[monthName]) {
        monthlyData[monthName] = [];
      }
      monthlyData[monthName].push(grade.nilai);
    });

    // Hitung rata-rata per bulan
    const result = [
      { bulan: "Jan", nilai: 0 },
      { bulan: "Feb", nilai: 0 },
      { bulan: "Mar", nilai: 0 },
      { bulan: "Apr", nilai: 0 },
      { bulan: "Mei", nilai: 0 },
      { bulan: "Jun", nilai: 0 },
      { bulan: "Jul", nilai: 0 },
      { bulan: "Agu", nilai: 0 },
      { bulan: "Sep", nilai: 0 },
      { bulan: "Okt", nilai: 0 },
      { bulan: "Nov", nilai: 0 },
      { bulan: "Des", nilai: 0 },
    ];

    result.forEach(item => {
      if (monthlyData[item.bulan]) {
        const sum = monthlyData[item.bulan].reduce((a, b) => a + b, 0);
        item.nilai = Math.round((sum / monthlyData[item.bulan].length) * 100) / 100;
      }
    });

    return result;
  }, [filteredGrades]);

  // Ambil data kehadiran dari localStorage
  const attendance = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("sips_attendance") || "[]");
    } catch {
      return [];
    }
  }, []);

  // Kartu ringkasan mengikuti filter aktif (didefinisikan setelah filteredAttendance)

  // Filter data kehadiran berdasarkan tahun ajaran dan semester
  const filteredAttendance = React.useMemo(() => {
    return attendance.filter((record: any) => {
      const tahunMatch = selectedTahunAjaran === "all" || record.tahunAjaran === selectedTahunAjaran;
      const semesterMatch = selectedSemester === "all" || record.semester === selectedSemester;
      return tahunMatch && semesterMatch;
    });
  }, [attendance, selectedTahunAjaran, selectedSemester]);

  // Hitung rata-rata nilai per mata pelajaran
  const subjectChartData = React.useMemo(() => {
    if (filteredGrades.length === 0) {
      return [];
    }

    const subjectData: { [key: string]: number[] } = {};
    
    filteredGrades.forEach((grade: any) => {
      const subjectName = grade.mataPelajaran === "Lainnya" ? grade.mataPelajaranLain : grade.mataPelajaran;
      if (subjectName) {
        if (!subjectData[subjectName]) {
          subjectData[subjectName] = [];
        }
        subjectData[subjectName].push(grade.nilai);
      }
    });

    return Object.entries(subjectData).map(([subject, values]) => {
      const sum = values.reduce((a, b) => a + b, 0);
      const average = Math.round((sum / values.length) * 100) / 100;
      return {
        mataPelajaran: subject,
        rataRata: average,
        jumlahData: values.length
      };
    }).sort((a, b) => b.rataRata - a.rataRata);
  }, [filteredGrades]);

  // Hitung rata-rata kehadiran per bulan
  const attendanceChartData = React.useMemo(() => {
    if (filteredAttendance.length === 0) {
      return [
        { bulan: "Jan", kehadiran: 0 },
        { bulan: "Feb", kehadiran: 0 },
        { bulan: "Mar", kehadiran: 0 },
        { bulan: "Apr", kehadiran: 0 },
        { bulan: "Mei", kehadiran: 0 },
        { bulan: "Jun", kehadiran: 0 },
        { bulan: "Jul", kehadiran: 0 },
        { bulan: "Agu", kehadiran: 0 },
        { bulan: "Sep", kehadiran: 0 },
        { bulan: "Okt", kehadiran: 0 },
        { bulan: "Nov", kehadiran: 0 },
        { bulan: "Des", kehadiran: 0 },
      ];
    }

    const monthlyAttendance: { [key: string]: number[] } = {};
    
    filteredAttendance.forEach((record: any) => {
      const date = new Date(record.tanggal || record.createdAt);
      const month = date.getMonth();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
      const monthName = monthNames[month];
      
      if (!monthlyAttendance[monthName]) {
        monthlyAttendance[monthName] = [];
      }
      monthlyAttendance[monthName].push(record.persen || 0);
    });

    const result = [
      { bulan: "Jan", kehadiran: 0 },
      { bulan: "Feb", kehadiran: 0 },
      { bulan: "Mar", kehadiran: 0 },
      { bulan: "Apr", kehadiran: 0 },
      { bulan: "Mei", kehadiran: 0 },
      { bulan: "Jun", kehadiran: 0 },
      { bulan: "Jul", kehadiran: 0 },
      { bulan: "Agu", kehadiran: 0 },
      { bulan: "Sep", kehadiran: 0 },
      { bulan: "Okt", kehadiran: 0 },
      { bulan: "Nov", kehadiran: 0 },
      { bulan: "Des", kehadiran: 0 },
    ];

    result.forEach(item => {
      if (monthlyAttendance[item.bulan]) {
        const sum = monthlyAttendance[item.bulan].reduce((a, b) => a + b, 0);
        item.kehadiran = Math.round((sum / monthlyAttendance[item.bulan].length) * 100) / 100;
      }
    });

    return result;
  }, [filteredAttendance]);

  // Kartu ringkasan mengikuti filter aktif (setelah filteredAttendance tersedia)
  const filteredStats = React.useMemo(() => {
    const totalStudents = JSON.parse(localStorage.getItem("sips_students") || "[]").length;

    const g = filteredGrades;
    const totalGrades = g.length;
    const averageGrade = totalGrades
      ? Math.round((g.reduce((a: number, x: any) => a + Number(x.nilai || 0), 0) / totalGrades) * 100) / 100
      : 0;

    const a = filteredAttendance;
    const totalAttendanceRecords = a.length;
    const averageAttendance = totalAttendanceRecords
      ? Math.round((a.reduce((s: number, r: any) => s + Number(r.persen || 0), 0) / totalAttendanceRecords) * 100) / 100
      : 0;

    // Siswa aktif dihitung dari data siswa dengan status Aktif
    const activeStudents = JSON.parse(localStorage.getItem("sips_students") || "[]").filter((s: any) => s.statusSiswa === "Aktif").length;

    return {
      totalStudents,
      activeStudents,
      totalGrades,
      averageGrade,
      totalAttendanceRecords,
      averageAttendance,
    };
  }, [filteredGrades, filteredAttendance]);

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Data Statistik</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-muted-foreground">Tahun Ajaran</label>
              <Select value={selectedTahunAjaran} onValueChange={setSelectedTahunAjaran}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Pilih Tahun Ajaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tahun Ajaran</SelectItem>
                  {availableTahunAjaran.map((tahun) => (
                    <SelectItem key={tahun} value={tahun}>
                      {tahun}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1 min-w-[150px]">
              <label className="text-sm font-medium text-muted-foreground">Semester</label>
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Pilih Semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Semester</SelectItem>
                  <SelectItem value="Ganjil">Ganjil</SelectItem>
                  <SelectItem value="Genap">Genap</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedTahunAjaran("all");
                  setSelectedSemester("all");
                }}
              >
                Reset Filter
              </Button>
            </div>
          </div>
          
          {/* Filter Info */}
          {(selectedTahunAjaran !== "all" || selectedSemester !== "all") && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Filter Aktif:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {selectedTahunAjaran !== "all" && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs">
                    Tahun Ajaran: {selectedTahunAjaran}
                  </span>
                )}
                {selectedSemester !== "all" && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs">
                    Semester: {selectedSemester}
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Overview (berdasarkan filter) */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Stat number={filteredStats.totalStudents.toString()} label="Total Siswa" />
        <Stat number={filteredStats.activeStudents.toString()} label="Siswa Aktif" />
        <Stat number={filteredStats.totalGrades.toString()} label="Total Nilai" />
        <Stat number={filteredStats.averageGrade.toString()} label="Rata-rata Nilai" />
        <Stat number={filteredStats.totalAttendanceRecords.toString()} label="Record Kehadiran" />
        <Stat number={`${filteredStats.averageAttendance}%`} label="Rata-rata Kehadiran" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rata-rata Nilai Per Bulan */}
        <Card>
        <CardHeader>
          <CardTitle>Rata-rata Nilai Per Bulan</CardTitle>
            <p className="text-sm text-muted-foreground">
              {filteredGrades.length} data nilai
            </p>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{ nilai: { label: "Nilai", color: "#10b981" } }}
            className="h-64"
          >
              <BarChart data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="bulan" tickLine={false} axisLine={false} />
              <Bar 
                dataKey="nilai" 
                fill="#10b981" 
                radius={6}
                stroke="#059669"
                strokeWidth={1}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

        {/* Rata-rata Nilai Per Mata Pelajaran */}
        <Card>
          <CardHeader>
            <CardTitle>Rata-rata Nilai Per Mata Pelajaran</CardTitle>
            <p className="text-sm text-muted-foreground">
              {subjectChartData.length} mata pelajaran
            </p>
          </CardHeader>
          <CardContent>
            {/* Tabel batang dengan warna berbeda per mata pelajaran */}
            <div className="overflow-x-auto -mx-2 md:mx-0">
              <div className="min-w-max md:min-w-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mata Pelajaran</TableHead>
                      <TableHead>Rata-rata</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjectChartData.map((row, idx) => {
                      // generate warna berbeda stabil berdasarkan index
                      const hues = [0, 30, 60, 90, 120, 150, 180, 200, 220, 260, 280, 320];
                      const hue = hues[idx % hues.length];
                      const barColor = `hsl(${hue} 90% 45%)`;
                      return (
                        <TableRow key={row.mataPelajaran}>
                          <TableCell className="font-medium">{row.mataPelajaran}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 w-[320px]">
                              <div
                                className="h-3 rounded"
                                style={{
                                  width: `${Math.min(100, Math.max(0, row.rataRata)) * 3}px`,
                                  backgroundColor: barColor,
                                }}
                                title={`${row.rataRata}`}
                              />
                              <span className="text-sm tabular-nums w-14">{row.rataRata}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {subjectChartData.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-sm text-muted-foreground text-center">
                          Belum ada data nilai sesuai filter.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rata-rata Kehadiran Per Bulan - Full Width */}
      <Card>
        <CardHeader>
          <CardTitle>Rata-rata Kehadiran Siswa Per Bulan</CardTitle>
          <p className="text-sm text-muted-foreground">
            {filteredAttendance.length} data kehadiran
          </p>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{ kehadiran: { label: "Kehadiran (%)", color: "#3b82f6" } }}
            className="h-64"
          >
            <BarChart data={attendanceChartData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="bulan" tickLine={false} axisLine={false} />
              <Bar 
                dataKey="kehadiran" 
                fill="#3b82f6" 
                radius={6}
                stroke="#1d4ed8"
                strokeWidth={1}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-extrabold">{number}</div>
      </CardContent>
    </Card>
  );
}

const agamaOptions = [
  "Islam",
  "Kristen",
  "Khatolik",
  "Hindu",
  "Budha",
  "Kepercayaan",
  "Konghucu",
] as const;
const pekerjaanOptions = [
  "Petani",
  "Pekebun",
  "Buruh Harian Lepas",
  "Karyawan Swasta",
  "Pegawai Negeri Sipil/ASN",
  "Lainnya",
] as const;
const statusOptions = [
  "Aktif",
  "Meninggal",
  "Pindahan",
  "Pindah Sekolah",
] as const;
const ketOptions = [
  "Siswa Berprestasi",
  "Siswa Kurang Mampu",
  "Penerima KIP",
  "Penerima Beasiswa",
  "Lainnya",
] as const;

const schema = z
  .object({
    namaLengkap: z.string().min(2),
    nik: z.string().regex(/^\d{16}$/, "NIK harus 16 digit"),
    tempatLahir: z.string().min(1),
    tanggalLahir: z
      .string()
      .min(1)
      .refine(
        (v) => !Number.isNaN(new Date(v).getTime()),
        "Tanggal tidak valid",
      ),
    nisn: z.string().min(1),
    nis: z.string().min(1),
    jenisKelamin: z.enum(["Laki-laki", "Perempuan"]),
    agama: z.enum(agamaOptions),
    alamatDomisili: z.string().min(1),
    noTeleponSiswa: z.string().min(1, "No Telepon/WA siswa harus diisi"),
    namaAyah: z.string().min(1),
    namaIbu: z.string().min(1),
    pekerjaanAyah: z.enum(pekerjaanOptions),
    pekerjaanAyahLain: z.string().optional(),
    pekerjaanIbu: z.enum(pekerjaanOptions),
    pekerjaanIbuLain: z.string().optional(),
    anakKe: z.coerce.number().int().min(1, "Anak ke harus minimal 1"),
    jumlahSaudara: z.coerce.number().int().min(0),
    diterimaDiKelas: z.string().min(1, "Kelas penerimaan harus diisi"),
    diterimaPadaTanggal: z.string().min(1, "Tanggal penerimaan harus diisi"),
    alamatOrtu: z.string().min(1),
    noTeleponOrtu: z.string().min(1, "No Telepon/WA orang tua harus diisi"),
    namaWali: z.string().optional(),
    alamatWali: z.string().optional(),
    noTeleponWali: z.string().optional(),
    pekerjaanWali: z.enum(pekerjaanOptions).optional(),
    pekerjaanWaliLain: z.string().optional(),
    asalSekolah: z.string().min(1),
    statusSiswa: z.enum(statusOptions),
    keterangan: z.array(z.enum(ketOptions)).optional().default([]),
    keteranganLain: z.string().optional(),
    foto: z
      .any()
      .optional()
      .refine((file) => !file || file instanceof File, "File tidak valid")
      .refine(
        (file) => !file || file.size <= 500 * 1024,
        "Ukuran maksimal 500 KB",
      )
      .refine(
        (file) =>
          !file || ["image/jpeg", "image/png", "image/jpg"].includes(file.type),
        "Format harus JPG/JPEG/PNG",
      ),
  })
  .refine(
    (data) =>
      data.pekerjaanAyah !== "Lainnya" || !!data.pekerjaanAyahLain?.trim(),
    {
      path: ["pekerjaanAyahLain"],
      message: "Harap isi pekerjaan ayah lainnya",
    },
  )
  .refine(
    (data) =>
      data.pekerjaanIbu !== "Lainnya" || !!data.pekerjaanIbuLain?.trim(),
    {
      path: ["pekerjaanIbuLain"],
      message: "Harap isi pekerjaan ibu lainnya",
    },
  )
  .refine(
    (data) =>
      !data.pekerjaanWali || data.pekerjaanWali !== "Lainnya" || !!data.pekerjaanWaliLain?.trim(),
    {
      path: ["pekerjaanWaliLain"],
      message: "Harap isi pekerjaan wali lainnya",
    },
  )
  .refine(
    (data) =>
      !data.keterangan?.includes("Lainnya") || !!data.keteranganLain?.trim(),
    {
      path: ["keteranganLain"],
      message: "Harap isi keterangan lainnya",
    },
  );

function DataSiswaForm() {
  const [students, setStudents] = useState<any[]>(() => {
    try {
      const data = JSON.parse(localStorage.getItem("sips_students") || "[]");
      
      // Migrate old data to ensure all required fields exist
      const migratedData = data.map((student: any) => {
        const now = new Date().toISOString();
        return {
          ...student,
          keteranganLain: student.keteranganLain || '',
          createdAt: student.createdAt || now,
          updatedAt: student.updatedAt || now,
        };
      });
      
      // Save migrated data back to localStorage if migration was needed
      const needsMigration = data.some((student: any) => !student.createdAt || !student.updatedAt || !student.keteranganLain);
      if (needsMigration) {
        localStorage.setItem("sips_students", JSON.stringify(migratedData));
      }
      
      return migratedData;
    } catch {
      return [];
    }
  });
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      namaLengkap: "",
      nik: "",
      tempatLahir: "",
      tanggalLahir: "",
      nisn: "",
      nis: "",
      jenisKelamin: "Laki-laki",
      agama: "Islam",
      alamatDomisili: "",
      namaAyah: "",
      namaIbu: "",
      pekerjaanAyah: "Petani",
      pekerjaanAyahLain: "",
      pekerjaanIbu: "Petani",
      pekerjaanIbuLain: "",
      anakKe: 1,
      jumlahSaudara: 0,
      diterimaDiKelas: "VII",
      diterimaPadaTanggal: "",
      alamatOrtu: "",
      asalSekolah: "",
      statusSiswa: "Aktif",
      keterangan: [],
      keteranganLain: "",
      foto: undefined,
    },
  });
  const pekerjaanAyahValue = form.watch("pekerjaanAyah");
  const pekerjaanIbuValue = form.watch("pekerjaanIbu");
  const keteranganValue = form.watch("keterangan");
  const [preview, setPreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);


  const onSubmit = async (values: z.infer<typeof schema>) => {
    const curr: any[] = JSON.parse(
      localStorage.getItem("sips_students") || "[]",
    );
    const file = values.foto as File | undefined;
    let fotoUrl: string | undefined = undefined;
    if (file) {
      fotoUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.readAsDataURL(file);
      });
    }

    if (editingId) {
      const existing = curr.find((s) => s.id === editingId) || {};
      const updated = {
        ...existing,
        id: editingId,
        namaLengkap: values.namaLengkap,
        nik: values.nik,
        nisn: values.nisn,
        nis: values.nis,
        tempatLahir: values.tempatLahir,
        tanggalLahir: values.tanggalLahir,
        jenisKelamin: values.jenisKelamin,
        agama: values.agama,
        alamatDomisili: values.alamatDomisili,
        noTeleponSiswa: values.noTeleponSiswa,
        namaAyah: values.namaAyah,
        namaIbu: values.namaIbu,
        pekerjaanAyah: values.pekerjaanAyah,
        pekerjaanAyahLain: values.pekerjaanAyahLain,
        pekerjaanIbu: values.pekerjaanIbu,
        pekerjaanIbuLain: values.pekerjaanIbuLain,
        anakKe: values.anakKe,
        jumlahSaudara: values.jumlahSaudara,
        diterimaDiKelas: values.diterimaDiKelas,
        diterimaPadaTanggal: values.diterimaPadaTanggal,
        alamatOrtu: values.alamatOrtu,
        noTeleponOrtu: values.noTeleponOrtu,
        namaWali: values.namaWali,
        alamatWali: values.alamatWali,
        noTeleponWali: values.noTeleponWali,
        pekerjaanWali: values.pekerjaanWali,
        pekerjaanWaliLain: values.pekerjaanWaliLain,
        asalSekolah: values.asalSekolah,
        statusSiswa: values.statusSiswa,
        keterangan: values.keterangan,
        keteranganLain: values.keteranganLain,
        fotoUrl: fotoUrl ?? existing.fotoUrl,
        updatedAt: new Date().toISOString(),
      };
      const next = curr.map((s) => (s.id === editingId ? updated : s));
      localStorage.setItem("sips_students", JSON.stringify(next));
      setStudents(next);
      setEditingId(null);
      toast.success("Data siswa diperbarui");
    } else {
      const record = {
        id: crypto.randomUUID?.() || String(Date.now()),
        namaLengkap: values.namaLengkap,
        nik: values.nik,
        nisn: values.nisn,
        nis: values.nis,
        tempatLahir: values.tempatLahir,
        tanggalLahir: values.tanggalLahir,
        jenisKelamin: values.jenisKelamin,
        agama: values.agama,
        alamatDomisili: values.alamatDomisili,
        noTeleponSiswa: values.noTeleponSiswa,
        namaAyah: values.namaAyah,
        namaIbu: values.namaIbu,
        pekerjaanAyah: values.pekerjaanAyah,
        pekerjaanAyahLain: values.pekerjaanAyahLain,
        pekerjaanIbu: values.pekerjaanIbu,
        pekerjaanIbuLain: values.pekerjaanIbuLain,
        anakKe: values.anakKe,
        jumlahSaudara: values.jumlahSaudara,
        diterimaDiKelas: values.diterimaDiKelas,
        diterimaPadaTanggal: values.diterimaPadaTanggal,
        alamatOrtu: values.alamatOrtu,
        noTeleponOrtu: values.noTeleponOrtu,
        namaWali: values.namaWali,
        alamatWali: values.alamatWali,
        noTeleponWali: values.noTeleponWali,
        pekerjaanWali: values.pekerjaanWali,
        pekerjaanWaliLain: values.pekerjaanWaliLain,
        asalSekolah: values.asalSekolah,
        statusSiswa: values.statusSiswa,
        keterangan: values.keterangan,
        keteranganLain: values.keteranganLain,
        fotoUrl,
      };
      const next = [record, ...curr];
      localStorage.setItem("sips_students", JSON.stringify(next));
      setStudents(next);
      toast.success("Data siswa tersimpan");
    }

    setPreview(null);
    form.reset({
      namaLengkap: "",
      nik: "",
      tempatLahir: "",
      tanggalLahir: "",
      nisn: "",
      nis: "",
      jenisKelamin: "Laki-laki",
      agama: "Islam",
      alamatDomisili: "",
      noTeleponSiswa: "",
      namaAyah: "",
      namaIbu: "",
      pekerjaanAyah: "Petani",
      pekerjaanAyahLain: "",
      pekerjaanIbu: "Petani",
      pekerjaanIbuLain: "",
      anakKe: 1,
      jumlahSaudara: 0,
      diterimaDiKelas: "VII",
      diterimaPadaTanggal: "",
      alamatOrtu: "",
      noTeleponOrtu: "",
      namaWali: "",
      alamatWali: "",
      noTeleponWali: "",
      pekerjaanWali: "Petani",
      pekerjaanWaliLain: "",
      asalSekolah: "",
      statusSiswa: "Aktif",
      keterangan: [],
      keteranganLain: "",
      foto: undefined,
    });
  };

  function handleEdit(s: any) {
    setEditingId(s.id);
    setPreview(s.fotoUrl || null);
    form.reset({
      namaLengkap: s.namaLengkap || "",
      nik: s.nik || "",
      tempatLahir: s.tempatLahir || "",
      tanggalLahir: s.tanggalLahir || "",
      nisn: s.nisn || "",
      nis: s.nis || "",
      jenisKelamin: s.jenisKelamin || "Laki-laki",
      agama: s.agama || "Islam",
      alamatDomisili: s.alamatDomisili || "",
      noTeleponSiswa: s.noTeleponSiswa || "",
      namaAyah: s.namaAyah || "",
      namaIbu: s.namaIbu || "",
      pekerjaanAyah: s.pekerjaanAyah || "Petani",
      pekerjaanAyahLain: s.pekerjaanAyahLain || "",
      pekerjaanIbu: s.pekerjaanIbu || "Petani",
      pekerjaanIbuLain: s.pekerjaanIbuLain || "",
      anakKe: s.anakKe ?? 1,
      jumlahSaudara: s.jumlahSaudara ?? 0,
      diterimaDiKelas: s.diterimaDiKelas || "VII",
      diterimaPadaTanggal: s.diterimaPadaTanggal || "",
      alamatOrtu: s.alamatOrtu || "",
      noTeleponOrtu: s.noTeleponOrtu || "",
      namaWali: s.namaWali || "",
      alamatWali: s.alamatWali || "",
      noTeleponWali: s.noTeleponWali || "",
      pekerjaanWali: s.pekerjaanWali || undefined,
      pekerjaanWaliLain: s.pekerjaanWaliLain || "",
      asalSekolah: s.asalSekolah || "",
      statusSiswa: s.statusSiswa || "Aktif",
      keterangan: s.keterangan || [],
      keteranganLain: s.keteranganLain || "",
      foto: undefined,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDelete(id: string) {
    if (!confirm("Hapus data siswa ini?")) return;
    const next = students.filter((x) => x.id !== id);
    localStorage.setItem("sips_students", JSON.stringify(next));
    setStudents(next);
    toast.success("Data siswa dihapus");
  }

  async function handlePrintBiodata(student: any) {
    try {
      await generateBiodataWord(student);
      toast.success("Biodata berhasil diunduh");
    } catch (error) {
      console.error("Error generating biodata:", error);
      toast.error("Gagal membuat biodata");
    }
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit Data Siswa" : "Data Siswa"}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:row-span-3 flex items-start gap-3">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview foto siswa"
                      className="h-24 w-24 rounded-md object-cover border"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-md border bg-muted/30 flex items-center justify-center text-xs text-muted-foreground">
                      Foto
                    </div>
                  )}
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name="foto"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Foto Siswa (JPG/PNG, maks 500 KB)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              accept="image/png, image/jpeg"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                form.setValue(
                                  "foto",
                                  file as File | undefined,
                                  { shouldValidate: true },
                                );
                                if (file) setPreview(URL.createObjectURL(file));
                                else setPreview(null);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="namaLengkap"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Lengkap Siswa</FormLabel>
                      <FormControl>
                        <Input placeholder="Nama lengkap" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="asalSekolah"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asal Sekolah</FormLabel>
                      <FormControl>
                        <Input placeholder="Asal sekolah" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nisn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NISN</FormLabel>
                      <FormControl>
                        <Input
                          inputMode="numeric"
                          placeholder="NISN"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NIS</FormLabel>
                      <FormControl>
                        <Input
                          inputMode="numeric"
                          placeholder="NIS"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nik"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NIK</FormLabel>
                      <FormControl>
                        <Input
                          inputMode="numeric"
                          placeholder="16 digit"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tempatLahir"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tempat Lahir</FormLabel>
                      <FormControl>
                        <Input placeholder="Kota/Kabupaten" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tanggalLahir"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal Lahir</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="jenisKelamin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jenis Kelamin</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                          <SelectItem value="Perempuan">Perempuan</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="agama"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agama</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {agamaOptions.map((a) => (
                            <SelectItem key={a} value={a}>
                              {a}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pekerjaanAyah"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pekerjaan Ayah</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih pekerjaan ayah" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {pekerjaanOptions.map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {pekerjaanAyahValue === "Lainnya" && (
                        <div className="mt-2">
                          <FormField
                            control={form.control}
                            name="pekerjaanAyahLain"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">
                                  Tuliskan Pekerjaan Ayah Lainnya
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Pekerjaan ayah lainnya"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pekerjaanIbu"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pekerjaan Ibu</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih pekerjaan ibu" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {pekerjaanOptions.map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {pekerjaanIbuValue === "Lainnya" && (
                        <div className="mt-2">
                          <FormField
                            control={form.control}
                            name="pekerjaanIbuLain"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">
                                  Tuliskan Pekerjaan Ibu Lainnya
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Pekerjaan ibu lainnya"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="anakKe"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anak Ke</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="1"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="diterimaDiKelas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diterima di Kelas</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih kelas" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="VII">VII</SelectItem>
                          <SelectItem value="VIII">VIII</SelectItem>
                          <SelectItem value="IX">IX</SelectItem>
                          <SelectItem value="X">X</SelectItem>
                          <SelectItem value="XI">XI</SelectItem>
                          <SelectItem value="XII">XII</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="diterimaPadaTanggal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diterima pada Tanggal</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="statusSiswa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status Siswa</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusOptions.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="jumlahSaudara"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jumlah Saudara</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="namaAyah"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Orang Tua (Ayah)</FormLabel>
                      <FormControl>
                        <Input placeholder="Nama Ayah" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="namaIbu"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Orang Tua (Ibu)</FormLabel>
                      <FormControl>
                        <Input placeholder="Nama Ibu" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="alamatDomisili"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alamat Domisili</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Alamat domisili"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="noTeleponSiswa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>No Telepon/WA Siswa</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="tel"
                        placeholder="08xxxxxxxxxx"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="alamatOrtu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alamat Orang Tua</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Alamat orang tua"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="noTeleponOrtu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>No Telepon/WA Orang Tua</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="tel"
                        placeholder="08xxxxxxxxxx"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Data Wali */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Data Wali (Opsional)</h3>
                
                <FormField
                  control={form.control}
                  name="namaWali"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Wali</FormLabel>
                      <FormControl>
                        <Input placeholder="Nama wali" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="alamatWali"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alamat Wali</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={3}
                          placeholder="Alamat wali"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="noTeleponWali"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>No Telepon/WA Wali</FormLabel>
                      <FormControl>
                        <Input
                          inputMode="tel"
                          placeholder="08xxxxxxxxxx"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pekerjaanWali"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pekerjaan Wali</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih pekerjaan wali" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {pekerjaanOptions.map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.watch("pekerjaanWali") === "Lainnya" && (
                        <div className="mt-2">
                          <FormField
                            control={form.control}
                            name="pekerjaanWaliLain"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">
                                  Tuliskan Pekerjaan Wali Lainnya
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Pekerjaan wali lainnya"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormLabel>Keterangan Lainnya</FormLabel>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {ketOptions.map((k) => (
                    <FormField
                      key={k}
                      control={form.control}
                      name="keterangan"
                      render={({ field }) => {
                        const checked = field.value?.includes(k);
                        return (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(v) => {
                                  const arr = new Set(field.value || []);
                                  if (v) arr.add(k);
                                  else arr.delete(k);
                                  field.onChange(Array.from(arr));
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">{k}</FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                {keteranganValue?.includes("Lainnya") && (
                  <div className="mt-3">
                    <FormField
                      control={form.control}
                      name="keteranganLain"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">
                            Tuliskan Keterangan Lainnya
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Keterangan lainnya"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                {editingId && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setEditingId(null);
                      setPreview(null);
                      form.reset({
                        namaLengkap: "",
                        nik: "",
                        tempatLahir: "",
                        tanggalLahir: "",
                        nisn: "",
                        nis: "",
                        jenisKelamin: "Laki-laki",
                        agama: "Islam",
                        alamatDomisili: "",
                        noTeleponSiswa: "",
                        namaAyah: "",
                        namaIbu: "",
                        pekerjaanAyah: "Petani",
                        pekerjaanAyahLain: "",
                        pekerjaanIbu: "Petani",
                        pekerjaanIbuLain: "",
                        jumlahSaudara: 0,
                        alamatOrtu: "",
                        noTeleponOrtu: "",
                        asalSekolah: "",
                        statusSiswa: "Aktif",
                        keterangan: [],
                        keteranganLain: "",
                        foto: undefined,
                      });
                    }}
                  >
                    Batal
                  </Button>
                )}
                <Button type="submit">
                  {editingId ? "Perbarui" : "Simpan"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Siswa Tersimpan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-2 md:mx-0">
            <div className="min-w-max md:min-w-0">
              <Table className="hidden md:table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>NIK</TableHead>
                    <TableHead>NISN</TableHead>
                    <TableHead>NIS</TableHead>
                    <TableHead>JK</TableHead>
                    <TableHead>Agama</TableHead>
                    <TableHead>Telepon Siswa</TableHead>
                    <TableHead>Telepon Ortu</TableHead>
                    <TableHead>Anak Ke</TableHead>
                    <TableHead>Pekerjaan Ayah</TableHead>
                    <TableHead>Pekerjaan Ibu</TableHead>
                    <TableHead>Diterima di Kelas</TableHead>
                    <TableHead>Nama Wali</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-28">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          {s.fotoUrl ? (
                            <img
                              src={s.fotoUrl}
                              alt={s.namaLengkap}
                              className="h-8 w-8 rounded object-cover border"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded bg-muted border" />
                          )}
                          <span>{s.namaLengkap}</span>
                        </div>
                      </TableCell>
                      <TableCell>{s.nik}</TableCell>
                      <TableCell>{s.nisn}</TableCell>
                      <TableCell>{s.nis}</TableCell>
                      <TableCell>{s.jenisKelamin}</TableCell>
                      <TableCell>{s.agama}</TableCell>
                      <TableCell>{s.noTeleponSiswa || "-"}</TableCell>
                      <TableCell>{s.noTeleponOrtu || "-"}</TableCell>
                      <TableCell>{s.anakKe || "-"}</TableCell>
                      <TableCell>{s.pekerjaanAyah || "-"}</TableCell>
                      <TableCell>{s.pekerjaanIbu || "-"}</TableCell>
                      <TableCell>{s.diterimaDiKelas || "-"}</TableCell>
                      <TableCell>{s.namaWali || "-"}</TableCell>
                      <TableCell>{s.statusSiswa}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(s)}
                          >
                            <Pencil className="mr-1 h-4 w-4" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handlePrintBiodata(s)}
                          >
                            <Printer className="mr-1 h-4 w-4" /> Cetak
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(s.id)}
                          >
                            <Trash2 className="mr-1 h-4 w-4" /> Hapus
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="md:hidden grid gap-3">
                {students.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    Belum ada data siswa.
                  </div>
                )}
                {students.map((s) => (
                  <div key={s.id} className="rounded-md border p-3 bg-card">
                    <div className="flex items-center gap-3">
                      {s.fotoUrl ? (
                        <img
                          src={s.fotoUrl}
                          alt={s.namaLengkap}
                          className="h-10 w-10 rounded object-cover border"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted border" />
                      )}
                      <div>
                        <div className="font-semibold">{s.namaLengkap}</div>
                        <div className="text-xs text-muted-foreground">
                          NIK {s.nik}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">NISN:</span>{" "}
                        {s.nisn}
                      </div>
                      <div>
                        <span className="text-muted-foreground">NIS:</span>{" "}
                        {s.nis}
                      </div>
                      <div>
                        <span className="text-muted-foreground">JK:</span>{" "}
                        {s.jenisKelamin}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Agama:</span>{" "}
                        {s.agama}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Telepon Siswa:</span>{" "}
                        {s.noTeleponSiswa || "-"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Telepon Ortu:</span>{" "}
                        {s.noTeleponOrtu || "-"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Anak Ke:</span>{" "}
                        {s.anakKe || "-"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Pekerjaan Ayah:</span>{" "}
                        {s.pekerjaanAyah || "-"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Pekerjaan Ibu:</span>{" "}
                        {s.pekerjaanIbu || "-"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Diterima di Kelas:</span>{" "}
                        {s.diterimaDiKelas || "-"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Nama Wali:</span>{" "}
                        {s.namaWali || "-"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Telepon Wali:</span>{" "}
                        {s.noTeleponWali || "-"}
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Status:</span>{" "}
                        {s.statusSiswa}
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(s)}
                        className="flex-1"
                      >
                        <Pencil className="mr-1 h-4 w-4" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handlePrintBiodata(s)}
                        className="flex-1"
                      >
                        <Printer className="mr-1 h-4 w-4" /> Cetak
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(s.id)}
                        className="flex-1"
                      >
                        <Trash2 className="mr-1 h-4 w-4" /> Hapus
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Halaman ini siap diisi sesuai kebutuhan. Lanjutkan instruksi untuk
          melengkapi form dan integrasi Supabase.
        </p>
      </CardContent>
    </Card>
  );
}

const mpOptions = [
  "Bahasa Indonesia",
  "Bahasa Inggris",
  "Matematika",
  "IPA",
  "IPS",
  "Lainnya",
] as const;

const kelasOptions = ["VII", "VIII", "IX"] as const;
const semesterOptions = ["Ganjil", "Genap"] as const;

const gradeSchema = z
  .object({
    studentId: z.string(),
    namaLengkap: z.string(),
    nik: z.string(),
    nisn: z.string(),
    nis: z.string(),
    mataPelajaran: z.enum(mpOptions),
    mataPelajaranLain: z.string().optional(),
    kelas: z.enum(kelasOptions),
    tahunAjaran: z.string().min(1, "Tahun ajaran harus diisi"),
    semester: z.enum(semesterOptions),
    kompetensi: z
      .array(z.string().min(1))
      .min(1, "Tambahkan minimal 1 kompetensi"),
    nilai: z.coerce.number().min(0).max(100),
    keterangan: z.string().optional(),
  })
  .refine(
    (d) => d.mataPelajaran !== "Lainnya" || !!d.mataPelajaranLain?.trim(),
    {
      path: ["mataPelajaranLain"],
      message: "Harap isi mata pelajaran lainnya",
    },
  );

function InputNilaiPage() {
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<any | null>(null);
  const [grades, setGrades] = React.useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("sips_grades") || "[]");
    } catch {
      return [];
    }
  });
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [tahunAjaranList, setTahunAjaranList] = React.useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("sips_tahun_ajaran") || '["2024/2025", "2023/2024"]');
    } catch {
      return ["2024/2025", "2023/2024"];
    }
  });
  const [newTahunAjaran, setNewTahunAjaran] = React.useState("");
  const [showAddTahunAjaran, setShowAddTahunAjaran] = React.useState(false);
  const students: any[] = React.useMemo(
    () => JSON.parse(localStorage.getItem("sips_students") || "[]"),
    [],
  );

  const filtered = React.useMemo(() => {
    if (!query.trim()) return [] as any[];
    const q = query.toLowerCase();
    return students.filter((s) =>
      [s.namaLengkap, s.nik, s.nisn, s.nis].some((v: string) =>
        String(v || "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [query, students]);

  const form = useForm<z.infer<typeof gradeSchema>>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      studentId: "",
      namaLengkap: "",
      nik: "",
      nisn: "",
      nis: "",
      mataPelajaran: "Bahasa Indonesia",
      mataPelajaranLain: "",
      kelas: "VII",
      tahunAjaran: "2024/2025",
      semester: "Ganjil",
      kompetensi: [],
      nilai: 0,
      keterangan: "",
    },
  });

  const addTahunAjaran = () => {
    if (newTahunAjaran.trim() && !tahunAjaranList.includes(newTahunAjaran.trim())) {
      const updated = [...tahunAjaranList, newTahunAjaran.trim()].sort();
      setTahunAjaranList(updated);
      localStorage.setItem("sips_tahun_ajaran", JSON.stringify(updated));
      setNewTahunAjaran("");
      setShowAddTahunAjaran(false);
      toast.success("Tahun ajaran berhasil ditambahkan");
    } else if (tahunAjaranList.includes(newTahunAjaran.trim())) {
      toast.error("Tahun ajaran sudah ada");
    } else {
      toast.error("Tahun ajaran tidak boleh kosong");
    }
  };

  const mpValue = form.watch("mataPelajaran");
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "kompetensi",
  });

  function editGrade(g: any) {
    setEditingId(g.id);
    setSelected({
      id: g.studentId,
      namaLengkap: g.namaLengkap,
      nik: g.nik,
      nisn: g.nisn,
      nis: g.nis,
    });
    form.reset({
      studentId: g.studentId,
      namaLengkap: g.namaLengkap,
      nik: g.nik,
      nisn: g.nisn,
      nis: g.nis,
      mataPelajaran: g.mataPelajaran,
      mataPelajaranLain: g.mataPelajaranLain || "",
      kelas: g.kelas || "VII",
      tahunAjaran: g.tahunAjaran || "2024/2025",
      semester: g.semester || "Ganjil",
      kompetensi: Array.isArray(g.kompetensi)
        ? g.kompetensi
        : [],
      nilai: g.nilai,
      keterangan: g.keterangan || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteGrade(id: string) {
    if (!confirm("Hapus nilai ini?")) return;
    const next = grades.filter((x) => x.id !== id);
    localStorage.setItem("sips_grades", JSON.stringify(next));
    setGrades(next);
    toast.success("Nilai dihapus");
  }

  const pickStudent = (s: any) => {
    setSelected(s);
    form.reset({
      studentId: s.id,
      namaLengkap: s.namaLengkap,
      nik: s.nik,
      nisn: s.nisn,
      nis: s.nis,
      mataPelajaran: "Bahasa Indonesia",
      mataPelajaranLain: "",
      kelas: "VII",
      tahunAjaran: "2024/2025",
      semester: "Ganjil",
      kompetensi: [],
      nilai: 0,
      keterangan: "",
    });
  };

  const submitGrade = (v: z.infer<typeof gradeSchema>) => {
    const curr: any[] = JSON.parse(localStorage.getItem("sips_grades") || "[]");
    if (editingId) {
      const next = curr.map((g) => (g.id === editingId ? { ...g, ...v } : g));
      localStorage.setItem("sips_grades", JSON.stringify(next));
      setGrades(next);
      setEditingId(null);
      toast.success("Nilai diperbarui");
    } else {
      const payload = {
        id: crypto.randomUUID?.() || String(Date.now()),
        ...v,
        tanggal: new Date().toISOString(),
      };
      const next = [payload, ...curr];
      localStorage.setItem("sips_grades", JSON.stringify(next));
      setGrades(next);
      toast.success("Nilai tersimpan");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Input Nilai Siswa</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Cari Siswa (Nama, NIK, NISN, NIS)
          </label>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik untuk mencari..."
          />
          {query && (
            <div className="mt-2 max-h-56 overflow-auto rounded-md border divide-y">
              {filtered.length === 0 && (
                <div className="p-3 text-sm text-muted-foreground">
                  Tidak ada hasil
                </div>
              )}
              {filtered.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  className="w-full text-left p-3 hover:bg-accent"
                  onClick={() => pickStudent(s)}
                >
                  <div className="font-medium">{s.namaLengkap}</div>
                  <div className="text-xs text-muted-foreground">
                    NIK {s.nik} • NISN {s.nisn} • NIS {s.nis}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {selected && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(submitGrade)}
              className="grid gap-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormItem>
                  <FormLabel>Nama Siswa</FormLabel>
                  <FormControl>
                    <Input readOnly {...form.register("namaLengkap")} />
                  </FormControl>
                </FormItem>
                <FormItem>
                  <FormLabel>NIK</FormLabel>
                  <FormControl>
                    <Input readOnly {...form.register("nik")} />
                  </FormControl>
                </FormItem>
                <FormItem>
                  <FormLabel>NISN</FormLabel>
                  <FormControl>
                    <Input readOnly {...form.register("nisn")} />
                  </FormControl>
                </FormItem>
                <FormItem>
                  <FormLabel>NIS</FormLabel>
                  <FormControl>
                    <Input readOnly {...form.register("nis")} />
                  </FormControl>
                </FormItem>
                <FormField
                  control={form.control}
                  name="mataPelajaran"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mata Pelajaran</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mpOptions.map((o) => (
                            <SelectItem key={o} value={o}>
                              {o}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {mpValue === "Lainnya" && (
                        <div className="mt-2">
                          <FormField
                            control={form.control}
                            name="mataPelajaranLain"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">
                                  Tuliskan mata pelajaran lainnya
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Mata pelajaran lainnya"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="kelas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kelas</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih Kelas" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {kelasOptions.map((k) => (
                            <SelectItem key={k} value={k}>
                              {k}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tahunAjaran"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tahun Ajaran</FormLabel>
                      <div className="flex gap-2">
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih Tahun Ajaran" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {tahunAjaranList.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAddTahunAjaran(!showAddTahunAjaran)}
                        >
                          +
                        </Button>
                      </div>
                      {showAddTahunAjaran && (
                        <div className="mt-2 flex gap-2">
                          <Input
                            placeholder="Tahun Ajaran (contoh: 2025/2026)"
                            value={newTahunAjaran}
                            onChange={(e) => setNewTahunAjaran(e.target.value)}
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={addTahunAjaran}
                          >
                            Tambah
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowAddTahunAjaran(false);
                              setNewTahunAjaran("");
                            }}
                          >
                            Batal
                          </Button>
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="semester"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Semester</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih Semester" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {semesterOptions.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <FormLabel>Kompetensi Diharapkan</FormLabel>
                {fields.map((f: any, idx: number) => (
                  <div key={f.id} className="flex gap-2">
                    <Input
                      {...form.register(`kompetensi.${idx}` as const)}
                      placeholder={`Kompetensi ke-${idx + 1}`}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => remove(idx)}
                      disabled={fields.length === 1}
                    >
                      Hapus
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append("")}
                >
                  Tambah Kompetensi
                </Button>
              </div>

              <FormField
                control={form.control}
                name="nilai"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nilai</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        max={100}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="keterangan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keterangan Kompetensi</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Catatan/pengamatan"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                {editingId && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setEditingId(null);
                    }}
                  >
                    Batal
                  </Button>
                )}
                <Button type="submit">
                  {editingId ? "Perbarui Nilai" : "Simpan Nilai"}
                </Button>
              </div>
            </form>
          </Form>
        )}

        <div className="pt-6 mt-4 border-t">
          <h4 className="text-sm font-semibold mb-3">Data Nilai Tersimpan</h4>
          <div className="overflow-x-auto -mx-2 md:mx-0">
            <div className="min-w-max md:min-w-0">
              <Table className="hidden md:table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>NIK</TableHead>
                    <TableHead>NISN</TableHead>
                    <TableHead>NIS</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead>Tahun Ajaran</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Mapel</TableHead>
                    <TableHead>Nilai</TableHead>
                    <TableHead className="w-28">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades.map((g) => {
                    const mp =
                      g.mataPelajaran === "Lainnya"
                        ? g.mataPelajaranLain
                        : g.mataPelajaran;
                    return (
                      <TableRow key={g.id}>
                        <TableCell>
                          {new Date(
                            g.tanggal || Date.now(),
                          ).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-medium">
                          {g.namaLengkap}
                        </TableCell>
                        <TableCell>{g.nik}</TableCell>
                        <TableCell>{g.nisn}</TableCell>
                        <TableCell>{g.nis}</TableCell>
                        <TableCell>{g.kelas || "VII"}</TableCell>
                        <TableCell>{g.tahunAjaran || "2024/2025"}</TableCell>
                        <TableCell>{g.semester || "Ganjil"}</TableCell>
                        <TableCell>{mp}</TableCell>
                        <TableCell>{Number(g.nilai).toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => editGrade(g)}
                            >
                              <Pencil className="mr-1 h-4 w-4" /> Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteGrade(g.id)}
                            >
                              <Trash2 className="mr-1 h-4 w-4" /> Hapus
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <div className="md:hidden grid gap-3">
                {grades.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    Belum ada data nilai.
                  </div>
                )}
                {grades.map((g) => {
                  const mp =
                    g.mataPelajaran === "Lainnya"
                      ? g.mataPelajaranLain
                      : g.mataPelajaran;
                  return (
                    <div key={g.id} className="rounded-md border p-3 bg-card">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="font-semibold">{g.namaLengkap}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(
                              g.tanggal || Date.now(),
                            ).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <div className="font-semibold">
                            {Number(g.nilai).toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {mp}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">NIK:</span>{" "}
                          {g.nik}
                        </div>
                        <div>
                          <span className="text-muted-foreground">NISN:</span>{" "}
                          {g.nisn}
                        </div>
                        <div>
                          <span className="text-muted-foreground">NIS:</span>{" "}
                          {g.nis}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Kelas:</span>{" "}
                          {g.kelas || "VII"}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tahun Ajaran:</span>{" "}
                          {g.tahunAjaran || "2024/2025"}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Semester:</span>{" "}
                          {g.semester || "Ganjil"}
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => editGrade(g)}
                          className="flex-1"
                        >
                          <Pencil className="mr-1 h-4 w-4" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteGrade(g.id)}
                          className="flex-1"
                        >
                          <Trash2 className="mr-1 h-4 w-4" /> Hapus
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AttendancePage() {
  const [mapel, setMapel] = React.useState<string>("");
  const [kelas, setKelas] = React.useState<string>("VII");
  const [tahunAjaran, setTahunAjaran] = React.useState<string>("2024/2025");
  const [semester, setSemester] = React.useState<string>("Ganjil");
  
  const students: any[] = React.useMemo(
    () => JSON.parse(localStorage.getItem("sips_students") || "[]"),
    [],
  );
  const grades: any[] = React.useMemo(
    () => JSON.parse(localStorage.getItem("sips_grades") || "[]"),
    [],
  );
  const subjects = React.useMemo(() => {
    const set = new Set<string>();
    grades.forEach((g) => {
      const m =
        g.mataPelajaran === "Lainnya" ? g.mataPelajaranLain : g.mataPelajaran;
      if (m) set.add(m);
    });
    return Array.from(set);
  }, [grades]);
  
  // Ambil daftar tahun ajaran yang tersedia
  const availableTahunAjaran = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("sips_tahun_ajaran") || '["2024/2025", "2023/2024"]');
    } catch {
      return ["2024/2025", "2023/2024"];
    }
  }, []);
  
  const [att, setAtt] = React.useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("sips_attendance") || "[]");
    } catch {
      return [];
    }
  });
  const rowsState = React.useRef<
    Record<string, { hadir: number; alpa: number; sakit: number; izin: number }>
  >({});
  function getRowDefaults(studentId: string) {
    const existing = att.find(
      (r) => r.studentId === studentId && r.mapel === mapel,
    );
    return {
      hadir: existing?.hadir ?? 0,
      alpa: existing?.alpa ?? 0,
      sakit: existing?.sakit ?? 0,
      izin: existing?.izin ?? 0,
    };
  }
  function setRow(
    studentId: string,
    field: keyof (typeof rowsState.current)[string],
    value: number,
  ) {
    const prev = rowsState.current[studentId] || getRowDefaults(studentId);
    rowsState.current[studentId] = { ...prev, [field]: value };
  }
  function percentOf(rs: {
    hadir: number;
    alpa: number;
    sakit: number;
    izin: number;
  }) {
    const t = rs.hadir + rs.alpa + rs.sakit + rs.izin;
    if (!t) return 0;
    return +(Math.round((rs.hadir / t) * 100 * 100) / 100).toFixed(2);
  }
  function saveRow(s: any) {
    if (!mapel) return;
    const rs = rowsState.current[s.id] || getRowDefaults(s.id);
    const rec = {
      id: crypto.randomUUID?.() || String(Date.now()),
      studentId: s.id,
      namaLengkap: s.namaLengkap,
      nik: s.nik,
      nisn: s.nisn,
      nis: s.nis,
      mapel,
      kelas,
      tahunAjaran,
      semester,
      hadir: rs.hadir,
      alpa: rs.alpa,
      sakit: rs.sakit,
      izin: rs.izin,
      persen: percentOf(rs),
      tanggal: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const curr: any[] = JSON.parse(
      localStorage.getItem("sips_attendance") || "[]",
    );
    const filtered = curr.filter(
      (x) => !(x.studentId === s.id && x.mapel === mapel),
    );
    const next = [rec, ...filtered];
    localStorage.setItem("sips_attendance", JSON.stringify(next));
    setAtt(next);
  }
  function editRec(r: any) {
    setMapel(r.mapel);
    setKelas(r.kelas || "VII");
    setTahunAjaran(r.tahunAjaran || "2024/2025");
    setSemester(r.semester || "Ganjil");
    rowsState.current[r.studentId] = {
      hadir: r.hadir,
      alpa: r.alpa,
      sakit: r.sakit,
      izin: r.izin,
    };
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function delRec(id: string) {
    if (!confirm("Hapus data kehadiran ini?")) return;
    const next = att.filter((x) => x.id !== id);
    localStorage.setItem("sips_attendance", JSON.stringify(next));
    setAtt(next);
  }
  const filteredAtt = React.useMemo(
    () => att.filter((x) => !mapel || x.mapel === mapel),
    [att, mapel],
  );

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Input Kehadiran Siswa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label>Mata Pelajaran</Label>
            <Select value={mapel} onValueChange={setMapel}>
                <SelectTrigger className="mt-1">
                <SelectValue placeholder="Pilih Mata Pelajaran" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!subjects.length && (
              <p className="text-sm text-muted-foreground mt-2">
                Belum ada mata pelajaran dari input nilai.
              </p>
            )}
            </div>

            <div>
              <Label>Kelas</Label>
              <Select value={kelas} onValueChange={setKelas}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Pilih Kelas" />
                </SelectTrigger>
                <SelectContent>
                  {kelasOptions.map((k) => (
                    <SelectItem key={k} value={k}>
                      {k}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tahun Ajaran</Label>
              <Select value={tahunAjaran} onValueChange={setTahunAjaran}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Pilih Tahun Ajaran" />
                </SelectTrigger>
                <SelectContent>
                  {availableTahunAjaran.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Semester</Label>
              <Select value={semester} onValueChange={setSemester}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Pilih Semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesterOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {mapel && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">
                Isian Kehadiran ({mapel})
              </h4>
              <div className="overflow-x-auto -mx-2 md:mx-0 hidden md:block">
                <div className="min-w-max md:min-w-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>NIK</TableHead>
                        <TableHead>NISN</TableHead>
                        <TableHead>NIS</TableHead>
                        <TableHead>Hadir</TableHead>
                        <TableHead>Alpa</TableHead>
                        <TableHead>Sakit</TableHead>
                        <TableHead>Izin</TableHead>
                        <TableHead>%</TableHead>
                        <TableHead className="w-28">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((s) => {
                        const d =
                          rowsState.current[s.id] || getRowDefaults(s.id);
                        return (
                          <TableRow key={s.id}>
                            <TableCell className="font-medium">
                              {s.namaLengkap}
                            </TableCell>
                            <TableCell>{s.nik}</TableCell>
                            <TableCell>{s.nisn}</TableCell>
                            <TableCell>{s.nis}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min={0}
                                defaultValue={d.hadir}
                                onChange={(e) =>
                                  setRow(s.id, "hadir", Number(e.target.value))
                                }
                                className="w-24"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min={0}
                                defaultValue={d.alpa}
                                onChange={(e) =>
                                  setRow(s.id, "alpa", Number(e.target.value))
                                }
                                className="w-24"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min={0}
                                defaultValue={d.sakit}
                                onChange={(e) =>
                                  setRow(s.id, "sakit", Number(e.target.value))
                                }
                                className="w-24"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min={0}
                                defaultValue={d.izin}
                                onChange={(e) =>
                                  setRow(s.id, "izin", Number(e.target.value))
                                }
                                className="w-24"
                              />
                            </TableCell>
                            <TableCell>{percentOf(d).toFixed(2)}%</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => saveRow(s)}
                                >
                                  Simpan
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="md:hidden grid gap-3">
                {students.map((s) => {
                  const d = rowsState.current[s.id] || getRowDefaults(s.id);
                  return (
                    <div key={s.id} className="rounded-md border p-3 bg-card">
                      <div className="font-semibold">{s.namaLengkap}</div>
                      <div className="text-xs text-muted-foreground">
                        NIK {s.nik} • NISN {s.nisn} • NIS {s.nis}
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <Input
                          type="number"
                          min={0}
                          defaultValue={d.hadir}
                          onChange={(e) =>
                            setRow(s.id, "hadir", Number(e.target.value))
                          }
                          placeholder="Hadir"
                        />
                        <Input
                          type="number"
                          min={0}
                          defaultValue={d.alpa}
                          onChange={(e) =>
                            setRow(s.id, "alpa", Number(e.target.value))
                          }
                          placeholder="Alpa"
                        />
                        <Input
                          type="number"
                          min={0}
                          defaultValue={d.sakit}
                          onChange={(e) =>
                            setRow(s.id, "sakit", Number(e.target.value))
                          }
                          placeholder="Sakit"
                        />
                        <Input
                          type="number"
                          min={0}
                          defaultValue={d.izin}
                          onChange={(e) =>
                            setRow(s.id, "izin", Number(e.target.value))
                          }
                          placeholder="Izin"
                        />
                      </div>
                      <div className="text-sm mt-2">
                        Persentase: {percentOf(d).toFixed(2)}%
                      </div>
                      <div className="mt-2 flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => saveRow(s)}
                        >
                          Simpan
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Kehadiran Tersimpan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-2 md:mx-0">
            <div className="min-w-max md:min-w-0">
              <Table className="hidden md:table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Mapel</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Hadir</TableHead>
                    <TableHead>Alpa</TableHead>
                    <TableHead>Sakit</TableHead>
                    <TableHead>Izin</TableHead>
                    <TableHead>%</TableHead>
                    <TableHead className="w-28">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAtt.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        {new Date(r.tanggal).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{r.mapel}</TableCell>
                      <TableCell className="font-medium">
                        {r.namaLengkap}
                      </TableCell>
                      <TableCell>{r.hadir}</TableCell>
                      <TableCell>{r.alpa}</TableCell>
                      <TableCell>{r.sakit}</TableCell>
                      <TableCell>{r.izin}</TableCell>
                      <TableCell>{Number(r.persen).toFixed(2)}%</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => editRec(r)}
                          >
                            <Pencil className="mr-1 h-4 w-4" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => delRec(r.id)}
                          >
                            <Trash2 className="mr-1 h-4 w-4" /> Hapus
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="md:hidden grid gap-3">
                {filteredAtt.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    Belum ada data kehadiran.
                  </div>
                )}
                {filteredAtt.map((r) => (
                  <div key={r.id} className="rounded-md border p-3 bg-card">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="font-semibold">{r.namaLengkap}</div>
                        <div className="text-xs text-muted-foreground">
                          {r.mapel} • {new Date(r.tanggal).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-semibold">
                          {Number(r.persen).toFixed(2)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          H:{r.hadir} A:{r.alpa} S:{r.sakit} I:{r.izin}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => editRec(r)}
                        className="flex-1"
                      >
                        <Pencil className="mr-1 h-4 w-4" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => delRec(r.id)}
                        className="flex-1"
                      >
                        <Trash2 className="mr-1 h-4 w-4" /> Hapus
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

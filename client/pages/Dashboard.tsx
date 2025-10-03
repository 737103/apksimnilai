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
  Database,
} from "lucide-react";
import { logout } from "@/lib/auth";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
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
  
  const data = [
    { bulan: "Jan", nilai: 78 },
    { bulan: "Feb", nilai: 82 },
    { bulan: "Mar", nilai: 75 },
    { bulan: "Apr", nilai: 88 },
    { bulan: "Mei", nilai: 91 },
    { bulan: "Jun", nilai: 85 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Rata-rata Nilai Per Bulan</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{ nilai: { label: "Nilai", color: "hsl(var(--primary))" } }}
            className="h-64"
          >
            <BarChart data={data}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="bulan" tickLine={false} axisLine={false} />
              <Bar dataKey="nilai" fill="var(--color-nilai)" radius={6} />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <div className="grid gap-4">
        <Stat number={stats.totalStudents.toString()} label="Total Siswa" />
        <Stat number={stats.activeStudents.toString()} label="Siswa Aktif" />
        <Stat number={stats.averageGrade.toString()} label="Rata-rata Nilai" />
        <Stat number={`${stats.averageAttendance}%`} label="Rata-rata Kehadiran" />
        <Stat number={stats.totalGrades.toString()} label="Total Nilai" />
        <Stat number={stats.totalAttendanceRecords.toString()} label="Record Kehadiran" />
      </div>
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
    namaAyah: z.string().min(1),
    namaIbu: z.string().min(1),
    pekerjaanOrtu: z.enum(pekerjaanOptions),
    pekerjaanOrtuLain: z.string().optional(),
    jumlahSaudara: z.coerce.number().int().min(0),
    alamatOrtu: z.string().min(1),
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
      data.pekerjaanOrtu !== "Lainnya" || !!data.pekerjaanOrtuLain?.trim(),
    {
      path: ["pekerjaanOrtuLain"],
      message: "Harap isi pekerjaan lainnya",
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
      return JSON.parse(localStorage.getItem("sips_students") || "[]");
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
      pekerjaanOrtu: "Petani",
      pekerjaanOrtuLain: "",
      jumlahSaudara: 0,
      alamatOrtu: "",
      asalSekolah: "",
      statusSiswa: "Aktif",
      keterangan: [],
      keteranganLain: "",
      foto: undefined,
    },
  });
  const pekerjaanOrtuValue = form.watch("pekerjaanOrtu");
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
        namaAyah: values.namaAyah,
        namaIbu: values.namaIbu,
        pekerjaanOrtu: values.pekerjaanOrtu,
        pekerjaanOrtuLain: values.pekerjaanOrtuLain,
        jumlahSaudara: values.jumlahSaudara,
        alamatOrtu: values.alamatOrtu,
        asalSekolah: values.asalSekolah,
        statusSiswa: values.statusSiswa,
        keterangan: values.keterangan,
        keteranganLain: values.keteranganLain,
        fotoUrl: fotoUrl ?? existing.fotoUrl,
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
        namaAyah: values.namaAyah,
        namaIbu: values.namaIbu,
        pekerjaanOrtu: values.pekerjaanOrtu,
        pekerjaanOrtuLain: values.pekerjaanOrtuLain,
        jumlahSaudara: values.jumlahSaudara,
        alamatOrtu: values.alamatOrtu,
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
      namaAyah: "",
      namaIbu: "",
      pekerjaanOrtu: "Petani",
      pekerjaanOrtuLain: "",
      jumlahSaudara: 0,
      alamatOrtu: "",
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
      namaAyah: s.namaAyah || "",
      namaIbu: s.namaIbu || "",
      pekerjaanOrtu: s.pekerjaanOrtu || "Petani",
      pekerjaanOrtuLain: s.pekerjaanOrtuLain || "",
      jumlahSaudara: s.jumlahSaudara ?? 0,
      alamatOrtu: s.alamatOrtu || "",
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
                  name="pekerjaanOrtu"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pekerjaan Orang Tua</FormLabel>
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
                          {pekerjaanOptions.map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {pekerjaanOrtuValue === "Lainnya" && (
                        <div className="mt-2">
                          <FormField
                            control={form.control}
                            name="pekerjaanOrtuLain"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">
                                  Tuliskan Pekerjaan Lainnya
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Pekerjaan lainnya"
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
                        namaAyah: "",
                        namaIbu: "",
                        pekerjaanOrtu: "Petani",
                        pekerjaanOrtuLain: "",
                        jumlahSaudara: 0,
                        alamatOrtu: "",
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

const gradeSchema = z
  .object({
    studentId: z.string(),
    namaLengkap: z.string(),
    nik: z.string(),
    nisn: z.string(),
    nis: z.string(),
    mataPelajaran: z.enum(mpOptions),
    mataPelajaranLain: z.string().optional(),
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
      kompetensi: [""],
      nilai: 0,
      keterangan: "",
    },
  });

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
      kompetensi: Array.isArray(g.kompetensi)
        ? g.kompetensi
        : [String(g.kompetensi || "")],
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
      kompetensi: [""],
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
      hadir: rs.hadir,
      alpa: rs.alpa,
      sakit: rs.sakit,
      izin: rs.izin,
      persen: percentOf(rs),
      tanggal: new Date().toISOString(),
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
          <div>
            <Label>Mata Pelajaran</Label>
            <Select value={mapel} onValueChange={setMapel}>
              <SelectTrigger className="mt-1 max-w-sm">
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

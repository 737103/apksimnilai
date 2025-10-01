import { useNavigate, Routes, Route, NavLink } from "react-router-dom";
import React, { useState } from "react";
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
import { BarChart3, CalendarCheck2, ClipboardList, FileSpreadsheet, LogOut, Users2 } from "lucide-react";
import { logout } from "@/lib/auth";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const menu = [
  { to: "/dashboard", label: "Statistik", icon: BarChart3, end: true },
  { to: "/dashboard/siswa", label: "Data Siswa", icon: Users2 },
  { to: "/dashboard/nilai", label: "Input Nilai Siswa", icon: ClipboardList },
  { to: "/dashboard/kehadiran", label: "Input Kehadiran Siswa", icon: CalendarCheck2 },
  { to: "/dashboard/laporan", label: "Kelola Laporan Siswa", icon: FileSpreadsheet },
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
            <div className="text-xs font-normal text-muted-foreground">SMPN 2 Baraka</div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menu.map((m) => (
              <SidebarMenuItem key={m.to}>
                <SidebarMenuButton asChild isActive={false}>
                  <NavLink to={m.to} end={m.end as boolean | undefined} className={({ isActive }) => (isActive ? "data-[active=true]" : undefined)}>
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
            <div className="font-semibold">Sistem Informasi Penilaian Siswa — SMPN 2 Baraka Kab. Enrekang</div>
          </div>
        </header>
        <main className="p-4 md:p-6 grid gap-4">
          <Routes>
            <Route index element={<StatistikSection />} />
            <Route path="siswa" element={<DataSiswaForm />} />
            <Route path="nilai" element={<Placeholder title="Input Nilai Siswa" />} />
            <Route path="kehadiran" element={<Placeholder title="Input Kehadiran Siswa" />} />
            <Route path="laporan" element={<Placeholder title="Kelola Laporan Siswa" />} />
          </Routes>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function StatistikSection() {
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
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <div className="grid gap-4">
        <Stat number="982" label="Jumlah Siswa" />
        <Stat number="96%" label="Rata-rata Kehadiran" />
        <Stat number="87" label="Rapor Diproses" />
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

const statusOptions = ["Aktif", "Meninggal", "Pindahan", "Pindah Sekolah"] as const;

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
      .refine((v) => !Number.isNaN(new Date(v).getTime()), "Tanggal tidak valid"),
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
      .refine((file) => !file || file.size <= 500 * 1024, "Ukuran maksimal 500 KB")
      .refine(
        (file) =>
          !file || ["image/jpeg", "image/png", "image/jpg"].includes(file.type),
        "Format harus JPG/JPEG/PNG",
      ),
  })
  .refine((data) => data.pekerjaanOrtu !== "Lainnya" || !!data.pekerjaanOrtuLain?.trim(), {
    path: ["pekerjaanOrtuLain"],
    message: "Harap isi pekerjaan lainnya",
  })
  .refine((data) => !data.keterangan?.includes("Lainnya") || !!data.keteranganLain?.trim(), {
    path: ["keteranganLain"],
    message: "Harap isi keterangan lainnya",
  });

function DataSiswaForm() {
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

  const onSubmit = (values: z.infer<typeof schema>) => {
    toast.success("Data siswa siap disimpan", {
      description: "Integrasi Supabase dapat diaktifkan setelah koneksi.",
    });
    console.log("data_siswa", values);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Siswa</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:row-span-3 flex items-start gap-3">
                {preview ? (
                  <img src={preview} alt="Preview foto siswa" className="h-24 w-24 rounded-md object-cover border" />
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
                        <FormLabel>Foto Siswa (JPG/PNG, maks 500 KB)</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/png, image/jpeg"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              form.setValue("foto", file as File | undefined, { shouldValidate: true });
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
                      <Input inputMode="numeric" placeholder="NISN" {...field} />
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
                      <Input inputMode="numeric" placeholder="NIS" {...field} />
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
                      <Input inputMode="numeric" placeholder="16 digit" {...field} />
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
                    <Select value={field.value} onValueChange={field.onChange}>
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
                    <Select value={field.value} onValueChange={field.onChange}>
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
                    <Select value={field.value} onValueChange={field.onChange}>
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
                              <FormLabel className="text-xs">Tuliskan Pekerjaan Lainnya</FormLabel>
                              <FormControl>
                                <Input placeholder="Pekerjaan lainnya" {...field} />
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
                    <Select value={field.value} onValueChange={field.onChange}>
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
                    <Textarea rows={3} placeholder="Alamat domisili" {...field} />
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
                    <Textarea rows={3} placeholder="Alamat orang tua" {...field} />
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
                        <FormLabel className="text-xs">Tuliskan Keterangan Lainnya</FormLabel>
                        <FormControl>
                          <Input placeholder="Keterangan lainnya" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="submit">Simpan</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
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
          Halaman ini siap diisi sesuai kebutuhan. Lanjutkan instruksi untuk melengkapi form dan integrasi Supabase.
        </p>
      </CardContent>
    </Card>
  );
}

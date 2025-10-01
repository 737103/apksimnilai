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
import { BarChart3, CalendarCheck2, ClipboardList, FileSpreadsheet, LogOut } from "lucide-react";
import { logout } from "@/lib/auth";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

const menu = [
  { to: "/dashboard", label: "Statistik", icon: BarChart3, end: true },
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
                  <NavLink to={m.to} end={m.end as boolean | undefined} className={({ isActive }) => isActive ? "data-[active=true]" : undefined}>
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

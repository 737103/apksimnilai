# Update Grafik Statistik - Rata-rata Nilai & Kehadiran

## 🎯 Fitur yang Ditambahkan

### **Grafik Baru di Menu Statistik:**

#### 1. **Rata-rata Nilai Per Mata Pelajaran**
- **Type**: Horizontal Bar Chart
- **Data Source**: Data nilai dari localStorage
- **Filter**: Tahun Ajaran & Semester
- **Layout**: Side-by-side dengan grafik bulanan

#### 2. **Rata-rata Kehadiran Siswa Per Bulan**
- **Type**: Vertical Bar Chart
- **Data Source**: Data kehadiran dari localStorage
- **Filter**: Tahun Ajaran & Semester
- **Layout**: Full width di bawah grafik nilai

#### 3. **Filter Terpusat**
- **Tahun Ajaran**: Dropdown dengan data dinamis
- **Semester**: Ganjil/Genap
- **Reset Filter**: Tombol untuk reset semua filter
- **Filter Info**: Badge yang menampilkan filter aktif

## 🔧 Technical Implementation

### **1. Layout Baru StatistikSection**

```tsx
return (
  <div className="space-y-6">
    {/* Filter Controls */}
    <Card>
      <CardHeader>
        <CardTitle>Filter Data Statistik</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filter UI */}
      </CardContent>
    </Card>

    {/* Stats Overview */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Stat cards */}
    </div>

    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Rata-rata Nilai Per Bulan */}
      {/* Rata-rata Nilai Per Mata Pelajaran */}
    </div>

    {/* Rata-rata Kehadiran Per Bulan - Full Width */}
    <Card>
      {/* Kehadiran Chart */}
    </Card>
  </div>
);
```

### **2. Data Processing Functions**

#### **Rata-rata Nilai Per Mata Pelajaran**
```typescript
const subjectChartData = React.useMemo(() => {
  if (filteredGrades.length === 0) return [];

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
```

#### **Rata-rata Kehadiran Per Bulan**
```typescript
const attendanceChartData = React.useMemo(() => {
  if (filteredAttendance.length === 0) {
    return [
      { bulan: "Jan", kehadiran: 0 },
      { bulan: "Feb", kehadiran: 0 },
      // ... 12 bulan
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

  // Hitung rata-rata per bulan
  const result = [
    { bulan: "Jan", kehadiran: 0 },
    { bulan: "Feb", kehadiran: 0 },
    // ... 12 bulan
  ];

  result.forEach(item => {
    if (monthlyAttendance[item.bulan]) {
      const sum = monthlyAttendance[item.bulan].reduce((a, b) => a + b, 0);
      item.kehadiran = Math.round((sum / monthlyAttendance[item.bulan].length) * 100) / 100;
    }
  });

  return result;
}, [filteredAttendance]);
```

### **3. Filter System**

#### **State Management**
```typescript
const [selectedTahunAjaran, setSelectedTahunAjaran] = React.useState<string>("all");
const [selectedSemester, setSelectedSemester] = React.useState<string>("all");

// Filter data berdasarkan tahun ajaran dan semester
const filteredGrades = React.useMemo(() => {
  return grades.filter((grade: any) => {
    const tahunMatch = selectedTahunAjaran === "all" || grade.tahunAjaran === selectedTahunAjaran;
    const semesterMatch = selectedSemester === "all" || grade.semester === selectedSemester;
    return tahunMatch && semesterMatch;
  });
}, [grades, selectedTahunAjaran, selectedSemester]);

const filteredAttendance = React.useMemo(() => {
  return attendance.filter((record: any) => {
    const tahunMatch = selectedTahunAjaran === "all" || record.tahunAjaran === selectedTahunAjaran;
    const semesterMatch = selectedSemester === "all" || record.semester === selectedSemester;
    return tahunMatch && semesterMatch;
  });
}, [attendance, selectedTahunAjaran, selectedSemester]);
```

#### **Filter UI**
```tsx
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
```

### **4. Chart Components**

#### **Rata-rata Nilai Per Mata Pelajaran (Horizontal)**
```tsx
<ChartContainer
  config={{ rataRata: { label: "Rata-rata", color: "hsl(var(--secondary))" } }}
  className="h-64"
>
  <BarChart data={subjectChartData} layout="horizontal">
    <CartesianGrid horizontal={false} />
    <XAxis type="number" tickLine={false} axisLine={false} />
    <YAxis dataKey="mataPelajaran" type="category" tickLine={false} axisLine={false} width={100} />
    <Bar dataKey="rataRata" fill="var(--color-rataRata)" radius={6} />
    <ChartTooltip
      cursor={false}
      content={<ChartTooltipContent hideLabel />}
    />
  </BarChart>
</ChartContainer>
```

#### **Rata-rata Kehadiran Per Bulan (Vertical)**
```tsx
<ChartContainer
  config={{ kehadiran: { label: "Kehadiran (%)", color: "hsl(var(--accent))" } }}
  className="h-64"
>
  <BarChart data={attendanceChartData}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="bulan" tickLine={false} axisLine={false} />
    <Bar dataKey="kehadiran" fill="var(--color-kehadiran)" radius={6} />
    <ChartTooltip
      cursor={false}
      content={<ChartTooltipContent hideLabel />}
    />
  </BarChart>
</ChartContainer>
```

## 📊 Data Structure Updates

### **1. Attendance Interface Update**
```typescript
export interface Attendance {
  id: string;
  studentId: string;
  namaLengkap: string;
  nik: string;
  nisn: string;
  nis: string;
  mapel: string;
  kelas: string;           // NEW
  tahunAjaran: string;     // NEW
  semester: string;        // NEW
  hadir: number;
  alpa: number;
  sakit: number;
  izin: number;
  persen: number;
  tanggal: string;
  createdAt: string;
  updatedAt: string;
}
```

### **2. AttendancePage Updates**
- **New Fields**: Kelas, Tahun Ajaran, Semester
- **Form Layout**: 4-column grid untuk field baru
- **Data Saving**: Include field baru saat menyimpan
- **Data Editing**: Load field baru saat edit

## 🎨 UI/UX Improvements

### **1. Responsive Layout**
- **Desktop**: 2-column grid untuk grafik nilai
- **Mobile**: Single column dengan full width
- **Filter**: Responsive dengan min-width constraints

### **2. Visual Hierarchy**
- **Filter Controls**: Card terpisah di atas
- **Stats Overview**: Grid 4 kolom
- **Charts**: Side-by-side untuk nilai, full width untuk kehadiran
- **Filter Info**: Badge dengan warna primary

### **3. Data Information**
- **Chart Headers**: Menampilkan jumlah data
- **Tooltips**: Informasi detail saat hover
- **Empty States**: Handling untuk data kosong

## 🚀 Features

### **1. Real-time Data**
- **Live Updates**: Grafik update otomatis saat data berubah
- **Filter Sync**: Semua grafik menggunakan filter yang sama
- **Data Count**: Menampilkan jumlah data yang difilter

### **2. Interactive Filtering**
- **Tahun Ajaran**: Dropdown dengan data dinamis
- **Semester**: Ganjil/Genap selection
- **Reset**: One-click reset semua filter
- **Visual Feedback**: Badge menampilkan filter aktif

### **3. Chart Types**
- **Nilai Per Bulan**: Vertical bar chart
- **Nilai Per Mapel**: Horizontal bar chart (sorted by average)
- **Kehadiran Per Bulan**: Vertical bar chart dengan persentase

## 📈 Data Processing

### **1. Nilai Per Mata Pelajaran**
- **Grouping**: By mata pelajaran (handle "Lainnya")
- **Calculation**: Rata-rata nilai per mata pelajaran
- **Sorting**: Descending by rata-rata
- **Metadata**: Jumlah data per mata pelajaran

### **2. Kehadiran Per Bulan**
- **Grouping**: By bulan (Jan-Des)
- **Calculation**: Rata-rata persentase kehadiran
- **Date Handling**: Extract month from tanggal/createdAt
- **Fallback**: 0% untuk bulan tanpa data

### **3. Filtering Logic**
- **Tahun Ajaran**: Exact match atau "all"
- **Semester**: Exact match atau "all"
- **Combined**: AND logic untuk kedua filter
- **Performance**: useMemo untuk optimization

## ✅ Status Implementation

- ✅ **Grafik Nilai Per Mapel**: Horizontal bar chart
- ✅ **Grafik Kehadiran Per Bulan**: Vertical bar chart
- ✅ **Filter System**: Tahun ajaran & semester
- ✅ **Data Processing**: Real-time calculation
- ✅ **UI Layout**: Responsive design
- ✅ **Data Structure**: Updated interfaces
- ✅ **Attendance Form**: Added new fields
- ✅ **Chart Integration**: Recharts components
- ✅ **Filter UI**: Interactive controls
- ✅ **Data Sync**: All charts use same filter

## 🎯 Ready to Use

**Semua grafik telah siap digunakan!**

### **Cara Menggunakan:**
1. **Buka**: http://localhost:8080
2. **Login**: Dengan kredensial yang tersedia
3. **Navigate**: Ke menu "Statistik"
4. **Filter**: Pilih tahun ajaran dan semester
5. **View**: Lihat 3 grafik dengan data real-time
6. **Reset**: Klik "Reset Filter" untuk melihat semua data

### **Grafik yang Tersedia:**
- 📊 **Rata-rata Nilai Per Bulan**: Tren nilai sepanjang tahun
- 📈 **Rata-rata Nilai Per Mata Pelajaran**: Perbandingan antar mapel
- 📋 **Rata-rata Kehadiran Per Bulan**: Tren kehadiran siswa

**Semua grafik terintegrasi dengan filter tahun ajaran dan semester!** 🎉

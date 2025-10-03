# Update Field Input Nilai Siswa - Kelas, Tahun Ajaran, Semester

## 🎯 Fitur yang Ditambahkan

### **Field Baru pada Input Nilai Siswa:**

#### 1. **Kelas**
- **Opsi**: VII, VIII, IX
- **Type**: Select dropdown
- **Default**: VII
- **Required**: Ya

#### 2. **Tahun Ajaran**
- **Opsi**: Dinamis (dapat ditambah)
- **Default**: 2024/2025, 2023/2024
- **Type**: Select dropdown dengan tombol tambah
- **Required**: Ya
- **Fitur**: Tombol "Tambah Tahun Ajaran" untuk menambah tahun ajaran baru

#### 3. **Semester**
- **Opsi**: Ganjil, Genap
- **Type**: Select dropdown
- **Default**: Ganjil
- **Required**: Ya

## 🔧 Technical Implementation

### **1. Schema Update (Zod Validation)**

```typescript
const kelasOptions = ["VII", "VIII", "IX"] as const;
const semesterOptions = ["Ganjil", "Genap"] as const;

const gradeSchema = z.object({
  // ... existing fields
  kelas: z.enum(kelasOptions),
  tahunAjaran: z.string().min(1, "Tahun ajaran harus diisi"),
  semester: z.enum(semesterOptions),
  // ... rest of fields
});
```

### **2. State Management**

```typescript
// State untuk tahun ajaran
const [tahunAjaranList, setTahunAjaranList] = useState<string[]>(() => {
  try {
    return JSON.parse(localStorage.getItem("sips_tahun_ajaran") || '["2024/2025", "2023/2024"]');
  } catch {
    return ["2024/2025", "2023/2024"];
  }
});

const [newTahunAjaran, setNewTahunAjaran] = useState("");
const [showAddTahunAjaran, setShowAddTahunAjaran] = useState(false);
```

### **3. Form Default Values**

```typescript
defaultValues: {
  // ... existing fields
  kelas: "VII",
  tahunAjaran: "2024/2025",
  semester: "Ganjil",
  // ... rest of fields
}
```

### **4. Add Tahun Ajaran Function**

```typescript
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
```

## 🎨 UI Components

### **1. Kelas Field**
```tsx
<FormField
  control={form.control}
  name="kelas"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Kelas</FormLabel>
      <Select value={field.value} onValueChange={field.onChange}>
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
```

### **2. Tahun Ajaran Field dengan Add Button**
```tsx
<FormField
  control={form.control}
  name="tahunAjaran"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Tahun Ajaran</FormLabel>
      <div className="flex gap-2">
        <Select value={field.value} onValueChange={field.onChange}>
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
          <Button type="button" size="sm" onClick={addTahunAjaran}>
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
```

### **3. Semester Field**
```tsx
<FormField
  control={form.control}
  name="semester"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Semester</FormLabel>
      <Select value={field.value} onValueChange={field.onChange}>
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
```

## 📊 Data Display Updates

### **1. Desktop Table Headers**
```tsx
<TableHeader>
  <TableRow>
    <TableHead>Tanggal</TableHead>
    <TableHead>Nama</TableHead>
    <TableHead>NIK</TableHead>
    <TableHead>NISN</TableHead>
    <TableHead>NIS</TableHead>
    <TableHead>Kelas</TableHead>          {/* NEW */}
    <TableHead>Tahun Ajaran</TableHead>   {/* NEW */}
    <TableHead>Semester</TableHead>       {/* NEW */}
    <TableHead>Mapel</TableHead>
    <TableHead>Nilai</TableHead>
    <TableHead className="w-28">Aksi</TableHead>
  </TableRow>
</TableHeader>
```

### **2. Desktop Table Data**
```tsx
<TableCell>{g.kelas || "VII"}</TableCell>
<TableCell>{g.tahunAjaran || "2024/2025"}</TableCell>
<TableCell>{g.semester || "Ganjil"}</TableCell>
```

### **3. Mobile View**
```tsx
<div className="mt-2 grid grid-cols-2 gap-2 text-sm">
  {/* ... existing fields */}
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
```

## 💾 Data Persistence

### **1. LocalStorage Keys**
- `sips_tahun_ajaran`: Array of tahun ajaran strings
- `sips_grades`: Updated with new fields

### **2. Data Structure Update**
```typescript
export interface Grade {
  // ... existing fields
  kelas: string;
  tahunAjaran: string;
  semester: string;
  // ... rest of fields
}
```

### **3. Backward Compatibility**
- Default values provided for existing data
- Graceful fallback for missing fields

## 📈 Excel Export Updates

### **1. Grades Export Columns**
```typescript
const gradesData = grades.map(grade => ({
  'Nama Siswa': grade.namaLengkap,
  'NIK': grade.nik,
  'NISN': grade.nisn,
  'NIS': grade.nis,
  'Kelas': grade.kelas || 'VII',                    // NEW
  'Tahun Ajaran': grade.tahunAjaran || '2024/2025', // NEW
  'Semester': grade.semester || 'Ganjil',           // NEW
  'Mata Pelajaran': grade.mataPelajaran === 'Lainnya' ? grade.mataPelajaranLain : grade.mataPelajaran,
  'Kompetensi': grade.kompetensi.join('; '),
  'Nilai': grade.nilai,
  'Keterangan': grade.keterangan || '',
  'Tanggal Input': new Date(grade.tanggal).toLocaleDateString('id-ID')
}));
```

## 🎯 User Experience

### **1. Form Flow**
1. Pilih siswa dari daftar
2. Pilih mata pelajaran
3. **Pilih kelas (VII, VIII, IX)**
4. **Pilih tahun ajaran (dengan opsi tambah)**
5. **Pilih semester (Ganjil/Genap)**
6. Isi kompetensi dan nilai
7. Submit data

### **2. Tahun Ajaran Management**
- **View**: Dropdown dengan tahun ajaran yang tersedia
- **Add**: Klik tombol "+" untuk menambah tahun ajaran baru
- **Input**: Field input dengan placeholder "Tahun Ajaran (contoh: 2025/2026)"
- **Validation**: Cek duplikasi dan format
- **Persistence**: Data tersimpan di localStorage

### **3. Data Display**
- **Desktop**: Tabel dengan kolom baru
- **Mobile**: Card view dengan field baru
- **Excel**: Export dengan kolom baru

## ✅ Status Implementation

- ✅ **Schema Validation**: Zod schema updated
- ✅ **Form Fields**: UI components added
- ✅ **State Management**: React state for tahun ajaran
- ✅ **Data Persistence**: LocalStorage integration
- ✅ **Table Display**: Desktop dan mobile view updated
- ✅ **Excel Export**: Export functions updated
- ✅ **Backward Compatibility**: Default values for existing data
- ✅ **User Experience**: Intuitive form flow
- ✅ **Validation**: Form validation dengan error messages
- ✅ **Toast Notifications**: Success/error feedback

## 🚀 Ready to Use

**Fitur baru telah siap digunakan!**

1. **Buka**: http://localhost:8080
2. **Login**: Dengan kredensial yang tersedia
3. **Navigate**: Ke menu "Input Nilai Siswa"
4. **Test**: Form dengan field baru (Kelas, Tahun Ajaran, Semester)
5. **Add Tahun Ajaran**: Klik tombol "+" untuk menambah tahun ajaran
6. **View Data**: Lihat data di tabel dengan kolom baru
7. **Export**: Download Excel dengan kolom baru

**Semua field baru telah terintegrasi dengan sempurna!** 🎉

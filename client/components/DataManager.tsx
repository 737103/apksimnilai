import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Download, 
  Upload, 
  Database, 
  AlertTriangle,
  CheckCircle,
  FileText,
  Trash2,
  RefreshCw,
  Copy,
  Eye,
  HardDrive
} from "lucide-react";
import { toast } from "sonner";
import { 
  exportAllData, 
  importAllData, 
  studentManager, 
  gradeManager, 
  attendanceManager,
  getStatistics,
  loadStudentsFromDatabase,
  loadGradesFromDatabase,
  loadAttendanceFromDatabase
} from "@/lib/data";

export function DataManager() {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importData, setImportData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoFileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      const data = exportAllData();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sips-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Data berhasil diekspor");
    } catch (error) {
      toast.error("Gagal mengekspor data");
    }
  };

  const handleExportStudents = () => {
    try {
      const data = JSON.stringify(studentManager.getAll(), null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sips-siswa-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Data siswa berhasil diekspor");
    } catch (error) {
      toast.error("Gagal mengekspor data siswa");
    }
  };

  const handleExportGrades = () => {
    try {
      const data = JSON.stringify(gradeManager.getAll(), null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sips-nilai-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Data nilai berhasil diekspor");
    } catch (error) {
      toast.error("Gagal mengekspor data nilai");
    }
  };

  const handleExportAttendance = () => {
    try {
      const data = JSON.stringify(attendanceManager.getAll(), null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sips-kehadiran-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Data kehadiran berhasil diekspor");
    } catch (error) {
      toast.error("Gagal mengekspor data kehadiran");
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file extension instead of MIME type for better compatibility
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.json')) {
      toast.error("File harus berformat JSON (.json)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        // Validate JSON format
        const parsedData = JSON.parse(content);
        
        // Check if it's a valid SIPS data format
        if (parsedData.students || parsedData.grades || parsedData.attendance) {
          // It's a complete SIPS export format
          setImportData(content);
          toast.success("File berhasil dibaca. Klik 'Impor Data' untuk melanjutkan.");
        } else if (Array.isArray(parsedData)) {
          // It's an array format (single data type)
          setImportData(content);
          toast.success("File berhasil dibaca. Klik 'Impor Data' untuk melanjutkan.");
        } else {
          toast.error("Format file tidak valid. Pastikan file adalah export dari SIPS.");
          return;
        }
      } catch (error) {
        toast.error("File bukan format JSON yang valid");
        return;
      }
    };
    reader.onerror = () => {
      toast.error("Gagal membaca file");
    };
    reader.readAsText(file, 'UTF-8');
    
    // Reset file input
    event.target.value = '';
  };

  const handlePreviewData = () => {
    try {
      const data = exportAllData();
      setPreviewData(data);
      setIsPreviewOpen(true);
    } catch (error) {
      toast.error("Gagal memuat preview data");
    }
  };

  const handleCopyToClipboard = () => {
    try {
      const data = exportAllData();
      navigator.clipboard.writeText(data);
      toast.success("Data berhasil disalin ke clipboard");
    } catch (error) {
      toast.error("Gagal menyalin data");
    }
  };

  const handleClearStudents = async () => {
    try {
      // Hapus di database (Neon)
      await fetch('/api/students', { method: 'DELETE' });
      // Hapus di local storage
      studentManager.clear();
      toast.success("Data siswa telah dihapus (lokal + Neon)");
      window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'students' } }));
      setTimeout(() => window.location.reload(), 800);
    } catch (error) {
      toast.error("Gagal menghapus data siswa");
    }
  };

  const handleClearGrades = async () => {
    try {
      await fetch('/api/grades', { method: 'DELETE' });
      gradeManager.clear();
      toast.success("Data nilai telah dihapus (lokal + Neon)");
      window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'grades' } }));
      setTimeout(() => window.location.reload(), 800);
    } catch (error) {
      toast.error("Gagal menghapus data nilai");
    }
  };

  const handleClearAttendance = async () => {
    try {
      await fetch('/api/attendance', { method: 'DELETE' });
      attendanceManager.clear();
      toast.success("Data kehadiran telah dihapus (lokal + Neon)");
      window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'attendance' } }));
      setTimeout(() => window.location.reload(), 800);
    } catch (error) {
      toast.error("Gagal menghapus data kehadiran");
    }
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      toast.error("Data import tidak boleh kosong");
      return;
    }

    setIsLoading(true);
    try {
      const parsed = JSON.parse(importData);
      // Hapus semua data di Neon terlebih dahulu
      await Promise.all([
        fetch('/api/attendance', { method: 'DELETE' }),
        fetch('/api/grades', { method: 'DELETE' }),
        fetch('/api/students', { method: 'DELETE' }),
      ]);

      // Import ke local storage
      if (!importAllData(importData)) {
        toast.error("Format data tidak valid");
        setIsLoading(false);
        return;
      }

      // Susun payload sync dari local agar konsisten dengan struktur yang digunakan server
      const payload = {
        students: parsed.students ?? [],
        grades: parsed.grades ?? [],
        attendance: parsed.attendance ?? [],
      };

      // Sync ke Neon menggunakan endpoint /api/sync
      const resp = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await resp.json();
      if (!resp.ok) {
        toast.error("Sinkronisasi ke Neon gagal (HTTP)");
      } else if (!result.success) {
        const errs = Array.isArray(result.errors) ? result.errors.slice(0, 3).join("; ") : "";
        toast.error(`Sinkronisasi ke Neon sebagian gagal: ${errs}`);
      } else {
        toast.success("Data berhasil diimpor dan disinkron ke Neon");
      }

      // Muat ulang data dari Neon ke local agar konsisten
      await Promise.all([
        loadStudentsFromDatabase(),
        loadGradesFromDatabase(),
        loadAttendanceFromDatabase(),
      ]);

      setImportData("");
      setIsImportOpen(false);
      window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'all' } }));
      setTimeout(() => window.location.reload(), 800);
    } catch (error) {
      toast.error("Gagal mengimpor data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileImportAndProcess = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file extension
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.json')) {
      toast.error("File harus berformat JSON (.json)");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content);
        if (parsedData.students || parsedData.grades || parsedData.attendance || Array.isArray(parsedData)) {
          setIsLoading(true);

          // Hapus semua data di Neon
          await Promise.all([
            fetch('/api/attendance', { method: 'DELETE' }),
            fetch('/api/grades', { method: 'DELETE' }),
            fetch('/api/students', { method: 'DELETE' }),
          ]);

          // Import ke local
          if (!importAllData(content)) {
            toast.error("Format data tidak valid");
            setIsLoading(false);
            return;
          }

          // Sync ke Neon
          const payload = {
            students: parsedData.students ?? [],
            grades: parsedData.grades ?? [],
            attendance: parsedData.attendance ?? [],
          };
          const resp = await fetch('/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const result = await resp.json();
          if (!resp.ok) {
            toast.error("Sinkronisasi ke Neon gagal (HTTP)");
          } else if (!result.success) {
            const errs = Array.isArray(result.errors) ? result.errors.slice(0, 3).join("; ") : "";
            toast.error(`Sinkronisasi ke Neon sebagian gagal: ${errs}`);
          } else {
            toast.success("File berhasil diimpor dan disinkron ke Neon");
          }

          // Muat ulang data dari Neon ke local agar konsisten
          await Promise.all([
            loadStudentsFromDatabase(),
            loadGradesFromDatabase(),
            loadAttendanceFromDatabase(),
          ]);

          window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'all' } }));
          setTimeout(() => window.location.reload(), 800);
          setIsLoading(false);
        } else {
          toast.error("Format file tidak valid. Pastikan file adalah export dari SIPS.");
        }
      } catch (error) {
        toast.error("File bukan format JSON yang valid");
      }
    };
    reader.onerror = () => {
      toast.error("Gagal membaca file");
    };
    reader.readAsText(file, 'UTF-8');
    
    // Reset file input
    event.target.value = '';
  };

  const handleClearAll = async () => {
    if (!confirm("PERINGATAN: Tindakan ini akan menghapus SEMUA data! Apakah Anda yakin?")) {
      return;
    }
    
    if (!confirm("Data yang dihapus TIDAK DAPAT DIPULIHKAN. Yakin ingin melanjutkan?")) {
      return;
    }

    try {
      // Jalankan penghapusan server paralel
      await Promise.all([
        fetch('/api/attendance', { method: 'DELETE' }),
        fetch('/api/grades', { method: 'DELETE' }),
        fetch('/api/students', { method: 'DELETE' })
      ]);
      // Hapus lokal
      studentManager.clear();
      gradeManager.clear();
      attendanceManager.clear();
      toast.success("Semua data telah dihapus (lokal + Neon)");
      window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'all' } }));
      setTimeout(() => window.location.reload(), 800);
    } catch (error) {
      toast.error("Gagal menghapus data");
    }
  };

  const stats = {
    students: studentManager.count,
    grades: gradeManager.count,
    attendance: attendanceManager.count,
  };

  const systemStats = getStatistics();

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Overview Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{stats.students}</div>
              <div className="text-sm text-muted-foreground">Total Siswa</div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{systemStats.activeStudents}</div>
              <div className="text-sm text-muted-foreground">Siswa Aktif</div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{stats.grades}</div>
              <div className="text-sm text-muted-foreground">Total Nilai</div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{stats.attendance}</div>
              <div className="text-sm text-muted-foreground">Record Kehadiran</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Ekspor Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button onClick={handleExport} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Ekspor Semua Data
            </Button>
            <Button onClick={handleCopyToClipboard} variant="outline" className="w-full">
              <Copy className="mr-2 h-4 w-4" />
              Salin ke Clipboard
            </Button>
          </div>
          
          <div className="pt-4 border-t">
            <h4 className="text-sm font-semibold mb-3">Ekspor Per Kategori</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button onClick={handleExportStudents} variant="outline" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                Data Siswa
              </Button>
              <Button onClick={handleExportGrades} variant="outline" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                Data Nilai
              </Button>
              <Button onClick={handleExportAttendance} variant="outline" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                Data Kehadiran
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Import Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Impor Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Impor dari Text
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Impor Data dari Text</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium">Peringatan:</p>
                        <p>Impor data akan mengganti semua data yang ada. Pastikan Anda sudah melakukan backup.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="import-data">Data JSON</Label>
                    <Textarea
                      id="import-data"
                      placeholder="Paste data JSON di sini..."
                      value={importData}
                      onChange={(e) => setImportData(e.target.value)}
                      rows={12}
                      className="mt-1 font-mono text-xs"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsImportOpen(false)}
                      className="flex-1"
                    >
                      Batal
                    </Button>
                    <Button 
                      onClick={handleImport} 
                      disabled={isLoading || !importData.trim()}
                      className="flex-1"
                    >
                      {isLoading ? "Mengimpor..." : "Impor Data"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              <HardDrive className="mr-2 h-4 w-4" />
              Impor File (Preview)
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />

            <Button 
              variant="default" 
              onClick={() => autoFileInputRef.current?.click()}
              className="w-full"
              disabled={isLoading}
            >
              <Upload className="mr-2 h-4 w-4" />
              {isLoading ? "Mengimpor..." : "Impor File (Auto)"}
            </Button>
            <input
              ref={autoFileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileImportAndProcess}
              className="hidden"
            />
          </div>
          
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Cara Import File:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li><strong>Impor File (Preview):</strong> Upload file, preview data, lalu klik "Impor Data"</li>
                  <li><strong>Impor File (Auto):</strong> Upload file dan langsung import tanpa preview</li>
                  <li>File harus berformat JSON (.json) dari export SIPS</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Preview Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handlePreviewData} variant="outline" className="w-full">
            <Eye className="mr-2 h-4 w-4" />
            Lihat Preview Data
          </Button>
          
          <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>Preview Data</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-lg">
                  <pre className="text-xs overflow-auto max-h-96 whitespace-pre-wrap">
                    {previewData}
                  </pre>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsPreviewOpen(false)}
                    className="flex-1"
                  >
                    Tutup
                  </Button>
                  <Button 
                    onClick={handleCopyToClipboard}
                    className="flex-1"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Salin ke Clipboard
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Clear Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Hapus Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus Data Siswa
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Data Siswa</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini akan menghapus semua data siswa. Data yang dihapus tidak dapat dipulihkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearStudents} className="bg-destructive">
                    Hapus Data Siswa
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus Data Nilai
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Data Nilai</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini akan menghapus semua data nilai. Data yang dihapus tidak dapat dipulihkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearGrades} className="bg-destructive">
                    Hapus Data Nilai
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus Data Kehadiran
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Data Kehadiran</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini akan menghapus semua data kehadiran. Data yang dihapus tidak dapat dipulihkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearAttendance} className="bg-destructive">
                    Hapus Data Kehadiran
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="pt-4 border-t">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Hapus Semua Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Semua Data</AlertDialogTitle>
                  <AlertDialogDescription>
                    PERINGATAN: Tindakan ini akan menghapus SEMUA data (siswa, nilai, dan kehadiran). 
                    Data yang dihapus TIDAK DAPAT DIPULIHKAN. Pastikan Anda sudah melakukan backup.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearAll} className="bg-destructive">
                    Hapus Semua Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Tindakan ini tidak dapat dibatalkan
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

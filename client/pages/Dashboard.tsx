import React from "react";

export function AttendancePage() {
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
      const m = g.mataPelajaran === "Lainnya" ? g.mataPelajaranLain : g.mataPelajaran;
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

  const rowsState = React.useRef<Record<string, { hadir: number; alpa: number; sakit: number; izin: number }>>({});

  function getRowDefaults(studentId: string) {
    const existing = att.find((r) => r.studentId === studentId && r.mapel === mapel);
    return {
      hadir: existing?.hadir ?? 0,
      alpa: existing?.alpa ?? 0,
      sakit: existing?.sakit ?? 0,
      izin: existing?.izin ?? 0,
    };
  }

  function setRow(studentId: string, field: keyof (typeof rowsState.current)[string], value: number) {
    const prev = rowsState.current[studentId] || getRowDefaults(studentId);
    rowsState.current[studentId] = { ...prev, [field]: value };
  }

  function percentOf(rs: { hadir: number; alpa: number; sakit: number; izin: number }) {
    const t = rs.hadir + rs.alpa + rs.sakit + rs.izin;
    if (!t) return 0;
    return +(Math.round(((rs.hadir / t) * 100) * 100) / 100).toFixed(2);
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
    const curr: any[] = JSON.parse(localStorage.getItem("sips_attendance") || "[]");
    const filtered = curr.filter((x) => !(x.studentId === s.id && x.mapel === mapel));
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

  const filteredAtt = React.useMemo(() => att.filter((x) => !mapel || x.mapel === mapel), [att, mapel]);

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Input Kehadiran Siswa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <FormLabel>Mata Pelajaran</FormLabel>
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
              <h4 className="text-sm font-semibold">Isian Kehadiran ({mapel})</h4>

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
                        const d = rowsState.current[s.id] || getRowDefaults(s.id);
                        return (
                          <TableRow key={s.id}>
                            <TableCell className="font-medium">{s.namaLengkap}</TableCell>
                            <TableCell>{s.nik}</TableCell>
                            <TableCell>{s.nisn}</TableCell>
                            <TableCell>{s.nis}</TableCell>
                            <TableCell>
                              <Input type="number" min={0} defaultValue={d.hadir} onChange={(e) => setRow(s.id, "hadir", Number(e.target.value))} className="w-24" />
                            </TableCell>
                            <TableCell>
                              <Input type="number" min={0} defaultValue={d.alpa} onChange={(e) => setRow(s.id, "alpa", Number(e.target.value))} className="w-24" />
                            </TableCell>
                            <TableCell>
                              <Input type="number" min={0} defaultValue={d.sakit} onChange={(e) => setRow(s.id, "sakit", Number(e.target.value))} className="w-24" />
                            </TableCell>
                            <TableCell>
                              <Input type="number" min={0} defaultValue={d.izin} onChange={(e) => setRow(s.id, "izin", Number(e.target.value))} className="w-24" />
                            </TableCell>
                            <TableCell>{percentOf(d).toFixed(2)}%</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => saveRow(s)}>Simpan</Button>
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
                      <div className="text-xs text-muted-foreground">NIK {s.nik} • NISN {s.nisn} • NIS {s.nis}</div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <Input type="number" min={0} defaultValue={d.hadir} onChange={(e) => setRow(s.id, "hadir", Number(e.target.value))} placeholder="Hadir" />
                        <Input type="number" min={0} defaultValue={d.alpa} onChange={(e) => setRow(s.id, "alpa", Number(e.target.value))} placeholder="Alpa" />
                        <Input type="number" min={0} defaultValue={d.sakit} onChange={(e) => setRow(s.id, "sakit", Number(e.target.value))} placeholder="Sakit" />
                        <Input type="number" min={0} defaultValue={d.izin} onChange={(e) => setRow(s.id, "izin", Number(e.target.value))} placeholder="Izin" />
                      </div>
                      <div className="text-sm mt-2">Persentase: {percentOf(d).toFixed(2)}%</div>
                      <div className="mt-2 flex gap-2">
                        <Button size="sm" className="flex-1" onClick={() => saveRow(s)}>Simpan</Button>
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
                      <TableCell>{new Date(r.tanggal).toLocaleDateString()}</TableCell>
                      <TableCell>{r.mapel}</TableCell>
                      <TableCell className="font-medium">{r.namaLengkap}</TableCell>
                      <TableCell>{r.hadir}</TableCell>
                      <TableCell>{r.alpa}</TableCell>
                      <TableCell>{r.sakit}</TableCell>
                      <TableCell>{r.izin}</TableCell>
                      <TableCell>{Number(r.persen).toFixed(2)}%</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => editRec(r)}><Pencil className="mr-1 h-4 w-4" /> Edit</Button>
                          <Button size="sm" variant="destructive" onClick={() => delRec(r.id)}><Trash2 className="mr-1 h-4 w-4" /> Hapus</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="md:hidden grid gap-3">
                {filteredAtt.length === 0 && (
                  <div className="text-sm text-muted-foreground">Belum ada data kehadiran.</div>
                )}
                {filteredAtt.map((r) => (
                  <div key={r.id} className="rounded-md border p-3 bg-card">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="font-semibold">{r.namaLengkap}</div>
                        <div className="text-xs text-muted-foreground">{r.mapel} • {new Date(r.tanggal).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-semibold">{Number(r.persen).toFixed(2)}%</div>
                        <div className="text-xs text-muted-foreground">H:{r.hadir} A:{r.alpa} S:{r.sakit} I:{r.izin}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => editRec(r)} className="flex-1"><Pencil className="mr-1 h-4 w-4" /> Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => delRec(r.id)} className="flex-1"><Trash2 className="mr-1 h-4 w-4" /> Hapus</Button>
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

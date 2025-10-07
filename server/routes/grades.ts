import type { RequestHandler } from "express";
import { query } from "../db";

function toNull<T>(v: T): T | null {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return v === "" || v === undefined ? null : v;
}

export const handleUpsertGrade: RequestHandler = async (req, res) => {
  const g = req.body as any;
  if (!g || !g.namaLengkap || (!g.nisn && !g.nis && !g.nik)) {
    res.status(400).json({ success: false, error: "Payload nilai tidak valid (butuh nisn/nis/nik)" });
    return;
  }

  try {
    // Resolve student_id
    const key = g.nisn || g.nis || g.nik;
    const found = await query<{ id: string }>(
      `select id from students where coalesce(nisn,'')=$1 or coalesce(nis,'')=$1 or coalesce(nik,'')=$1 limit 1`,
      [key]
    );
    if (!found.rows[0]) {
      res.status(404).json({ success: false, error: "Siswa tidak ditemukan untuk nilai ini" });
      return;
    }
    const studentId = found.rows[0].id;

    // Insert grade
    await query(
      `insert into grades (
         student_id, mata_pelajaran, mata_pelajaran_lain, kelas, tahun_ajaran, semester,
         kompetensi, nilai, keterangan, tanggal
       ) values (
         $1,$2,$3,$4,$5,$6,$7,$8,$9,$10::date
       )`,
      [
        studentId,
        g.mataPelajaran,
        toNull(g.mataPelajaranLain),
        g.kelas,
        g.tahunAjaran,
        g.semester,
        Array.isArray(g.kompetensi) ? g.kompetensi : [],
        g.nilai,
        toNull(g.keterangan),
        g.tanggal,
      ]
    );

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message });
  }
};



import type { RequestHandler } from "express";
import { query } from "../db";

function toNull<T>(v: T): T | null {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return v === "" || v === undefined ? null : v;
}

export const handleUpsertAttendance: RequestHandler = async (req, res) => {
  const a = req.body as any;
  if (!a || (!a.nisn && !a.nis && !a.nik) || !a.mapel) {
    res.status(400).json({ success: false, error: "Payload kehadiran tidak valid (butuh nisn/nis/nik dan mapel)" });
    return;
  }

  try {
    const key = a.nisn || a.nis || a.nik;
    const found = await query<{ id: string }>(
      `select id from students where coalesce(nisn,'')=$1 or coalesce(nis,'')=$1 or coalesce(nik,'')=$1 limit 1`,
      [key]
    );
    if (!found.rows[0]) {
      res.status(404).json({ success: false, error: "Siswa tidak ditemukan untuk kehadiran ini" });
      return;
    }
    const studentId = found.rows[0].id;

    await query(
      `insert into attendance (
         student_id, mapel, kelas, tahun_ajaran, semester,
         hadir, alpa, sakit, izin, tanggal
       ) values (
         $1,$2,$3,$4,$5,$6,$7,$8,$9,$10::date
       )`,
      [
        studentId,
        a.mapel,
        a.kelas,
        a.tahunAjaran,
        a.semester,
        a.hadir ?? 0,
        a.alpa ?? 0,
        a.sakit ?? 0,
        a.izin ?? 0,
        a.tanggal,
      ]
    );

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message });
  }
};



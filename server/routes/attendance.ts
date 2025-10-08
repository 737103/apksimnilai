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

export const handleGetAllAttendance: RequestHandler = async (_req, res) => {
  try {
    const { rows } = await query<any>(
      `select 
         a.id,
         a.student_id,
         s.nama_lengkap as "namaLengkap",
         s.nik,
         s.nisn,
         s.nis,
         a.mapel,
         a.kelas,
         a.tahun_ajaran as "tahunAjaran",
         a.semester,
         a.hadir,
         a.alpa,
         a.sakit,
         a.izin,
         coalesce(nullif(a.hadir + a.izin + a.sakit + a.alpa, 0), 0) as total_hari,
         case when (a.hadir + a.izin + a.sakit + a.alpa) > 0 
              then round((a.hadir::numeric / (a.hadir + a.izin + a.sakit + a.alpa)) * 100, 2)
              else 0 end as "persen",
         a.tanggal,
         a.created_at as "createdAt",
         a.updated_at as "updatedAt"
       from attendance a
       join students s on s.id = a.student_id
       order by a.created_at desc`
    );
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message });
  }
};



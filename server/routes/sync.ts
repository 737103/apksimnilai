import type { RequestHandler } from "express";
import { query } from "../db";
import type { SyncRequest, SyncResponse, SyncPayloadStudent, SyncPayloadGrade, SyncPayloadAttendance } from "@shared/api";

async function upsertStudent(s: SyncPayloadStudent): Promise<string> {
  // Choose a stable unique key preference: nisn > nis > nik; fallback to nama+tanggalLahir is unsafe, skip
  const keyValue = s.nisn || s.nis || s.nik;
  let studentId: string | undefined;

  if (keyValue) {
    // Try find existing
    const findSql = `
      select id from students where coalesce(nisn, '') = $1 or coalesce(nis, '') = $1 or coalesce(nik, '') = $1
      limit 1
    `;
    const found = await query<{ id: string }>(findSql, [keyValue]);
    if (found.rows[0]) {
      studentId = found.rows[0].id;
      // Update basic fields
      await query(
        `update students set
           nama_lengkap = coalesce($2, nama_lengkap),
           nik = coalesce($3, nik),
           nisn = coalesce($4, nisn),
           nis = coalesce($5, nis),
           tempat_lahir = coalesce($6, tempat_lahir),
           tanggal_lahir = coalesce($7::date, tanggal_lahir),
           jenis_kelamin = coalesce($8::jenis_kelamin, jenis_kelamin),
           agama = coalesce($9, agama),
           alamat_domisili = coalesce($10, alamat_domisili),
           no_telepon_siswa = coalesce($11, no_telepon_siswa),
           nama_ayah = coalesce($12, nama_ayah),
           nama_ibu = coalesce($13, nama_ibu),
           pekerjaan_ayah = coalesce($14, pekerjaan_ayah),
           pekerjaan_ayah_lain = coalesce($15, pekerjaan_ayah_lain),
           pekerjaan_ibu = coalesce($16, pekerjaan_ibu),
           pekerjaan_ibu_lain = coalesce($17, pekerjaan_ibu_lain),
           anak_ke = coalesce($18, anak_ke),
           jumlah_saudara = coalesce($19, jumlah_saudara),
           diterima_di_kelas = coalesce($20, diterima_di_kelas),
           diterima_pada_tanggal = coalesce($21::date, diterima_pada_tanggal),
           alamat_ortu = coalesce($22, alamat_ortu),
           no_telepon_ortu = coalesce($23, no_telepon_ortu),
           nama_wali = coalesce($24, nama_wali),
           alamat_wali = coalesce($25, alamat_wali),
           no_telepon_wali = coalesce($26, no_telepon_wali),
           pekerjaan_wali = coalesce($27, pekerjaan_wali),
           pekerjaan_wali_lain = coalesce($28, pekerjaan_wali_lain),
           asal_sekolah = coalesce($29, asal_sekolah),
           status_siswa = coalesce($30, status_siswa),
           keterangan = coalesce($31, keterangan),
           foto_url = coalesce($32, foto_url)
         where id = $1`,
        [
          studentId,
          s.namaLengkap,
          s.nik ?? null,
          s.nisn ?? null,
          s.nis ?? null,
          s.tempatLahir ?? null,
          s.tanggalLahir ?? null,
          s.jenisKelamin ?? null,
          s.agama ?? null,
          s.alamatDomisili ?? null,
          s.noTeleponSiswa ?? null,
          s.namaAyah ?? null,
          s.namaIbu ?? null,
          s.pekerjaanAyah ?? null,
          s.pekerjaanAyahLain ?? null,
          s.pekerjaanIbu ?? null,
          s.pekerjaanIbuLain ?? null,
          s.anakKe ?? null,
          s.jumlahSaudara ?? null,
          s.diterimaDiKelas ?? null,
          s.diterimaPadaTanggal ?? null,
          s.alamatOrtu ?? null,
          s.noTeleponOrtu ?? null,
          s.namaWali ?? null,
          s.alamatWali ?? null,
          s.noTeleponWali ?? null,
          s.pekerjaanWali ?? null,
          s.pekerjaanWaliLain ?? null,
          s.asalSekolah ?? null,
          s.statusSiswa ?? null,
          s.keterangan ?? null,
          s.fotoUrl ?? null,
        ]
      );
    }
  }

  if (!studentId) {
    const insertSql = `
      insert into students (
        nama_lengkap, nik, nisn, nis, tempat_lahir, tanggal_lahir, jenis_kelamin, agama,
        alamat_domisili, no_telepon_siswa, nama_ayah, nama_ibu, pekerjaan_ayah, pekerjaan_ayah_lain,
        pekerjaan_ibu, pekerjaan_ibu_lain, anak_ke, jumlah_saudara, diterima_di_kelas, diterima_pada_tanggal,
        alamat_ortu, no_telepon_ortu, nama_wali, alamat_wali, no_telepon_wali, pekerjaan_wali, pekerjaan_wali_lain,
        asal_sekolah, status_siswa, keterangan, foto_url
      ) values (
        $1,$2,$3,$4,$5,$6::date,$7::jenis_kelamin,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20::date,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32
      ) returning id
    `;
    const ins = await query<{ id: string }>(insertSql, [
      s.namaLengkap,
      s.nik ?? null,
      s.nisn ?? null,
      s.nis ?? null,
      s.tempatLahir ?? null,
      s.tanggalLahir ?? null,
      s.jenisKelamin ?? null,
      s.agama ?? null,
      s.alamatDomisili ?? null,
      s.noTeleponSiswa ?? null,
      s.namaAyah ?? null,
      s.namaIbu ?? null,
      s.pekerjaanAyah ?? null,
      s.pekerjaanAyahLain ?? null,
      s.pekerjaanIbu ?? null,
      s.pekerjaanIbuLain ?? null,
      s.anakKe ?? null,
      s.jumlahSaudara ?? null,
      s.diterimaDiKelas ?? null,
      s.diterimaPadaTanggal ?? null,
      s.alamatOrtu ?? null,
      s.noTeleponOrtu ?? null,
      s.namaWali ?? null,
      s.alamatWali ?? null,
      s.noTeleponWali ?? null,
      s.pekerjaanWali ?? null,
      s.pekerjaanWaliLain ?? null,
      s.asalSekolah ?? null,
      s.statusSiswa ?? null,
      s.keterangan ?? null,
      s.fotoUrl ?? null,
    ]);
    studentId = ins.rows[0].id;
  }

  return studentId;
}

async function insertGrade(g: SyncPayloadGrade, studentId: string) {
  await query(
    `insert into grades (
       student_id, mata_pelajaran, mata_pelajaran_lain, kelas, tahun_ajaran, semester,
       kompetensi, nilai, keterangan, tanggal
     ) values (
       $1, $2, $3, $4, $5, $6, $7, $8, $9, $10::date
     ) on conflict do nothing`,
    [
      studentId,
      g.mataPelajaran,
      g.mataPelajaranLain ?? null,
      g.kelas,
      g.tahunAjaran,
      g.semester,
      g.kompetensi ?? [],
      g.nilai,
      g.keterangan ?? null,
      g.tanggal,
    ]
  );
}

async function insertAttendance(a: SyncPayloadAttendance, studentId: string) {
  await query(
    `insert into attendance (
       student_id, mapel, kelas, tahun_ajaran, semester,
       hadir, alpa, sakit, izin, tanggal
     ) values (
       $1,$2,$3,$4,$5,$6,$7,$8,$9,$10::date
     ) on conflict do nothing`,
    [
      studentId,
      a.mapel,
      a.kelas,
      a.tahunAjaran,
      a.semester,
      a.hadir,
      a.alpa,
      a.sakit,
      a.izin,
      a.tanggal,
    ]
  );
}

export const handleSync: RequestHandler = async (req, res) => {
  const payload = req.body as SyncRequest | undefined;
  if (!payload) {
    const response: SyncResponse = {
      success: false,
      inserted: { students: 0, grades: 0, attendance: 0 },
      upsertedStudents: 0,
      errors: ["Payload kosong"],
    };
    res.status(400).json(response);
    return;
  }

  const errors: string[] = [];
  let upsertedStudents = 0;
  let insertedStudents = 0;
  let insertedGrades = 0;
  let insertedAttendance = 0;

  try {
    // Upsert students first and map local id -> db id
    const idMap = new Map<string, string>();
    for (const s of payload.students ?? []) {
      try {
        const dbId = await upsertStudent(s);
        idMap.set(s.id, dbId);
        upsertedStudents += 1;
        insertedStudents += 1; // includes new inserts; counting together for simplicity
      } catch (e) {
        errors.push(`Gagal upsert student ${s.id}: ${(e as Error).message}`);
      }
    }

    // Grades
    for (const g of payload.grades ?? []) {
      const dbId = idMap.get(g.studentId);
      if (!dbId) {
        // Try resolve by nisn/nis if provided
        const key = g.nisn || g.nis || g.nik;
        if (key) {
          const found = await query<{ id: string }>(
            `select id from students where coalesce(nisn,'')=$1 or coalesce(nis,'')=$1 or coalesce(nik,'')=$1 limit 1`,
            [key]
          );
          if (found.rows[0]) {
            await insertGrade(g, found.rows[0].id);
            insertedGrades += 1;
            continue;
          }
        }
        errors.push(`Tidak menemukan student untuk grade ${g.id}`);
        continue;
      }
      try {
        await insertGrade(g, dbId);
        insertedGrades += 1;
      } catch (e) {
        errors.push(`Gagal insert grade ${g.id}: ${(e as Error).message}`);
      }
    }

    // Attendance
    for (const a of payload.attendance ?? []) {
      const dbId = idMap.get(a.studentId);
      if (!dbId) {
        const key = a.nisn || a.nis || a.nik;
        if (key) {
          const found = await query<{ id: string }>(
            `select id from students where coalesce(nisn,'')=$1 or coalesce(nis,'')=$1 or coalesce(nik,'')=$1 limit 1`,
            [key]
          );
          if (found.rows[0]) {
            await insertAttendance(a, found.rows[0].id);
            insertedAttendance += 1;
            continue;
          }
        }
        errors.push(`Tidak menemukan student untuk attendance ${a.id}`);
        continue;
      }
      try {
        await insertAttendance(a, dbId);
        insertedAttendance += 1;
      } catch (e) {
        errors.push(`Gagal insert attendance ${a.id}: ${(e as Error).message}`);
      }
    }

    const response: SyncResponse = {
      success: errors.length === 0,
      inserted: { students: insertedStudents, grades: insertedGrades, attendance: insertedAttendance },
      upsertedStudents,
      errors: errors.length ? errors : undefined,
    };
    res.json(response);
  } catch (e) {
    const response: SyncResponse = {
      success: false,
      inserted: { students: 0, grades: 0, attendance: 0 },
      upsertedStudents: 0,
      errors: [(e as Error).message],
    };
    res.status(500).json(response);
  }
};

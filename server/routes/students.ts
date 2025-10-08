import type { RequestHandler } from "express";
import { query } from "../db";

function pickKey(s: any): string | null {
  return s?.nisn || s?.nis || s?.nik || null;
}

function toNull<T>(v: T): T | null {
  // Normalizes empty strings/undefined to null for SQL casts
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return v === "" || v === undefined ? null : v;
}

export const handleUpsertStudent: RequestHandler = async (req, res) => {
  // Ensure schema exists (idempotent)
  try {
    await query(`create extension if not exists pgcrypto;`);
    await query(
      `do $$
       begin
         if not exists (select 1 from pg_type where typname = 'jenis_kelamin') then
           create type jenis_kelamin as enum ('Laki-laki','Perempuan');
         end if;
       end$$;`
    );
    await query(
      `create table if not exists students (
         id uuid primary key default gen_random_uuid(),
         nama_lengkap text not null,
         nik text,
         nisn text,
         nis text,
         tempat_lahir text,
         tanggal_lahir date,
         jenis_kelamin jenis_kelamin,
         agama text,
         alamat_domisili text,
         no_telepon_siswa text,
         nama_ayah text,
         nama_ibu text,
         pekerjaan_ayah text,
         pekerjaan_ayah_lain text,
         pekerjaan_ibu text,
         pekerjaan_ibu_lain text,
         anak_ke int,
         jumlah_saudara int,
         diterima_di_kelas text,
         diterima_pada_tanggal date,
         alamat_ortu text,
         no_telepon_ortu text,
         nama_wali text,
         alamat_wali text,
         no_telepon_wali text,
         pekerjaan_wali text,
         pekerjaan_wali_lain text,
         asal_sekolah text,
         status_siswa text,
         keterangan text[],
         foto_url text,
         created_at timestamptz not null default now(),
         updated_at timestamptz not null default now()
       );`
    );
    await query(
      `alter table students
         add column if not exists nama_lengkap text,
         add column if not exists nik text,
         add column if not exists nisn text,
         add column if not exists nis text,
         add column if not exists tempat_lahir text,
         add column if not exists tanggal_lahir date,
         add column if not exists jenis_kelamin jenis_kelamin,
         add column if not exists agama text,
         add column if not exists alamat_domisili text,
         add column if not exists no_telepon_siswa text,
         add column if not exists nama_ayah text,
         add column if not exists nama_ibu text,
         add column if not exists pekerjaan_ayah text,
         add column if not exists pekerjaan_ayah_lain text,
         add column if not exists pekerjaan_ibu text,
         add column if not exists pekerjaan_ibu_lain text,
         add column if not exists anak_ke int,
         add column if not exists jumlah_saudara int,
         add column if not exists diterima_di_kelas text,
         add column if not exists diterima_pada_tanggal date,
         add column if not exists alamat_ortu text,
         add column if not exists no_telepon_ortu text,
         add column if not exists nama_wali text,
         add column if not exists alamat_wali text,
         add column if not exists no_telepon_wali text,
         add column if not exists pekerjaan_wali text,
         add column if not exists pekerjaan_wali_lain text,
         add column if not exists asal_sekolah text,
         add column if not exists status_siswa text,
         add column if not exists keterangan text[],
         add column if not exists foto_url text,
         add column if not exists created_at timestamptz not null default now(),
         add column if not exists updated_at timestamptz not null default now();`
    );
  } catch (e) {
    res.status(500).json({ success: false, error: `Init schema gagal: ${(e as Error).message}` });
    return;
  }

  const s = req.body as any;
  if (!s || !s.namaLengkap) {
    res.status(400).json({ success: false, error: "Payload siswa tidak valid" });
    return;
  }
  const key = pickKey(s);
  const jk = s?.jenisKelamin === "Laki-laki" || s?.jenisKelamin === "Perempuan" ? s.jenisKelamin : null;
  // Prevent oversized base64 images from being stored; keep only modest-sized photos
  const safeFotoUrl: string | null =
    typeof s?.fotoUrl === "string" && s.fotoUrl.length > 0 && s.fotoUrl.length <= 200_000 ? s.fotoUrl : null;
  try {
    if (key) {
      const found = await query<{ id: string }>(
        `select id from students where coalesce(nisn,'')=$1 or coalesce(nis,'')=$1 or coalesce(nik,'')=$1 limit 1`,
        [key]
      );
      if (found.rows[0]) {
        const id = found.rows[0].id;
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
            id,
            toNull(s.namaLengkap),
            toNull(s.nik),
            toNull(s.nisn),
            toNull(s.nis),
            toNull(s.tempatLahir),
            toNull(s.tanggalLahir),
            toNull(jk),
            toNull(s.agama),
            toNull(s.alamatDomisili),
            toNull(s.noTeleponSiswa),
            toNull(s.namaAyah),
            toNull(s.namaIbu),
            toNull(s.pekerjaanAyah),
            toNull(s.pekerjaanAyahLain),
            toNull(s.pekerjaanIbu),
            toNull(s.pekerjaanIbuLain),
            toNull(s.anakKe),
            toNull(s.jumlahSaudara),
            toNull(s.diterimaDiKelas),
            toNull(s.diterimaPadaTanggal),
            toNull(s.alamatOrtu),
            toNull(s.noTeleponOrtu),
            toNull(s.namaWali),
            toNull(s.alamatWali),
            toNull(s.noTeleponWali),
            toNull(s.pekerjaanWali),
            toNull(s.pekerjaanWaliLain),
            toNull(s.asalSekolah),
            toNull(s.statusSiswa),
            Array.isArray(s.keterangan) ? s.keterangan : null,
            safeFotoUrl,
          ]
        );
        res.json({ success: true, id });
        return;
      }
    }

    // Insert minimal row first, then update all fields. This avoids column count mismatches.
    const inserted = await query<{ id: string }>(
      `insert into students (nama_lengkap) values ($1) returning id`,
      [toNull(s.namaLengkap)]
    );
    const newId = inserted.rows[0].id;

    await query(
      `update students set
         nik = coalesce($2, nik),
         nisn = coalesce($3, nisn),
         nis = coalesce($4, nis),
         tempat_lahir = coalesce($5, tempat_lahir),
         tanggal_lahir = coalesce($6::date, tanggal_lahir),
         jenis_kelamin = coalesce($7::jenis_kelamin, jenis_kelamin),
         agama = coalesce($8, agama),
         alamat_domisili = coalesce($9, alamat_domisili),
         no_telepon_siswa = coalesce($10, no_telepon_siswa),
         nama_ayah = coalesce($11, nama_ayah),
         nama_ibu = coalesce($12, nama_ibu),
         pekerjaan_ayah = coalesce($13, pekerjaan_ayah),
         pekerjaan_ayah_lain = coalesce($14, pekerjaan_ayah_lain),
         pekerjaan_ibu = coalesce($15, pekerjaan_ibu),
         pekerjaan_ibu_lain = coalesce($16, pekerjaan_ibu_lain),
         anak_ke = coalesce($17, anak_ke),
         jumlah_saudara = coalesce($18, jumlah_saudara),
         diterima_di_kelas = coalesce($19, diterima_di_kelas),
         diterima_pada_tanggal = coalesce($20::date, diterima_pada_tanggal),
         alamat_ortu = coalesce($21, alamat_ortu),
         no_telepon_ortu = coalesce($22, no_telepon_ortu),
         nama_wali = coalesce($23, nama_wali),
         alamat_wali = coalesce($24, alamat_wali),
         no_telepon_wali = coalesce($25, no_telepon_wali),
         pekerjaan_wali = coalesce($26, pekerjaan_wali),
         pekerjaan_wali_lain = coalesce($27, pekerjaan_wali_lain),
         asal_sekolah = coalesce($28, asal_sekolah),
         status_siswa = coalesce($29, status_siswa),
         keterangan = coalesce($30, keterangan),
         foto_url = coalesce($31, foto_url)
       where id = $1`,
      [
        newId,
        toNull(s.nik),
        toNull(s.nisn),
        toNull(s.nis),
        toNull(s.tempatLahir),
        toNull(s.tanggalLahir),
        toNull(jk),
        toNull(s.agama),
        toNull(s.alamatDomisili),
        toNull(s.noTeleponSiswa),
        toNull(s.namaAyah),
        toNull(s.namaIbu),
        toNull(s.pekerjaanAyah),
        toNull(s.pekerjaanAyahLain),
        toNull(s.pekerjaanIbu),
        toNull(s.pekerjaanIbuLain),
        toNull(s.anakKe),
        toNull(s.jumlahSaudara),
        toNull(s.diterimaDiKelas),
        toNull(s.diterimaPadaTanggal),
        toNull(s.alamatOrtu),
        toNull(s.noTeleponOrtu),
        toNull(s.namaWali),
        toNull(s.alamatWali),
        toNull(s.noTeleponWali),
        toNull(s.pekerjaanWali),
        toNull(s.pekerjaanWaliLain),
        toNull(s.asalSekolah),
        toNull(s.statusSiswa),
        Array.isArray(s.keterangan) ? s.keterangan : null,
        safeFotoUrl,
      ]
    );
    res.json({ success: true, id: newId });
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message });
  }
};

export const handleDeleteStudent: RequestHandler = async (req, res) => {
  const s = req.body as any;
  const key = pickKey(s);
  if (!key) {
    res.status(400).json({ success: false, error: "Butuh nisn/nis/nik untuk hapus" });
    return;
  }
  try {
    await query(
      `delete from students where coalesce(nisn,'')=$1 or coalesce(nis,'')=$1 or coalesce(nik,'')=$1`,
      [key]
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message });
  }
};

export const handleTestConnection: RequestHandler = async (req, res) => {
  try {
    const result = await query("SELECT NOW() as current_time, version() as postgres_version");
    res.json({ 
      success: true, 
      message: "Database connection successful",
      data: result.rows[0]
    });
  } catch (e) {
    res.status(500).json({ 
      success: false, 
      error: `Database connection failed: ${(e as Error).message}` 
    });
  }
};



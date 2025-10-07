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
  const s = req.body as any;
  if (!s || !s.namaLengkap) {
    res.status(400).json({ success: false, error: "Payload siswa tidak valid" });
    return;
  }
  const key = pickKey(s);
  const jk = s?.jenisKelamin === "Laki-laki" || s?.jenisKelamin === "Perempuan" ? s.jenisKelamin : null;
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
            toNull(s.fotoUrl),
          ]
        );
        res.json({ success: true, id });
        return;
      }
    }

    const ins = await query<{ id: string }>(
      `insert into students (
         nama_lengkap, nik, nisn, nis, tempat_lahir, tanggal_lahir, jenis_kelamin, agama,
         alamat_domisili, no_telepon_siswa, nama_ayah, nama_ibu, pekerjaan_ayah, pekerjaan_ayah_lain,
         pekerjaan_ibu, pekerjaan_ibu_lain, anak_ke, jumlah_saudara, diterima_di_kelas, diterima_pada_tanggal,
         alamat_ortu, no_telepon_ortu, nama_wali, alamat_wali, no_telepon_wali, pekerjaan_wali, pekerjaan_wali_lain,
         asal_sekolah, status_siswa, keterangan, foto_url
       ) values (
         $1,$2,$3,$4,$5,$6::date,$7::jenis_kelamin,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20::date,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32
       ) returning id`,
      [
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
        toNull(s.fotoUrl),
      ]
    );
    res.json({ success: true, id: ins.rows[0].id });
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



#!/usr/bin/env node

/**
 * Script Admin untuk Mengelola User Login Aplikasi Simnilai
 * 
 * Script ini memungkinkan Anda untuk:
 * - Menginisialisasi user default
 * - Mengubah username dan password
 * - Menambah user baru
 * - Menghapus user
 * - Melihat daftar user
 */

import { Pool } from "pg";
import readline from "readline";

// Database configuration
const config = {
  host: 'ep-ancient-dawn-a19vr88t-pooler.ap-southeast-1.aws.neon.tech',
  port: 5432,
  database: 'neondb',
  user: 'neondb_owner',
  password: 'npg_Xu9mTPqUN0tE',
  ssl: { rejectUnauthorized: false },
};

let pool: Pool;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool(config);
  }
  return pool;
}

async function query<T = unknown>(text: string, params?: unknown[]): Promise<{ rows: T[] }> {
  const client = await getPool().connect();
  try {
    const result = await client.query(text, params);
    return { rows: result.rows };
  } finally {
    client.release();
  }
}

async function ensureUserTable() {
  await query(`create extension if not exists pgcrypto;`);
  
  await query(`
    create table if not exists app_user (
      id uuid primary key default gen_random_uuid(),
      username text unique not null,
      password_hash text not null,
      role text not null default 'user',
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
  `);
}

async function initDefaultUsers() {
  console.log("🔄 Menginisialisasi user default...");
  
  const defaultUsers = [
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'guru', password: 'guru123', role: 'teacher' },
    { username: 'dalle', password: 'asrahabu', role: 'user' }
  ];
  
  for (const user of defaultUsers) {
    // Check if user exists
    const existing = await query(
      `select id from app_user where username = $1`,
      [user.username]
    );
    
    if (existing.rows.length === 0) {
      await query(
        `insert into app_user (username, password_hash, role) 
         values ($1, crypt($2, gen_salt('bf')), $3)`,
        [user.username, user.password, user.role]
      );
      console.log(`✅ User ${user.username} berhasil dibuat`);
    } else {
      console.log(`⚠️  User ${user.username} sudah ada`);
    }
  }
  
  console.log("✅ Inisialisasi user default selesai!");
}

async function listUsers() {
  console.log("📋 Daftar User:");
  console.log("=" .repeat(50));
  
  const result = await query(
    `select username, role, created_at, updated_at 
     from app_user 
     order by created_at desc`
  );
  
  if (result.rows.length === 0) {
    console.log("❌ Tidak ada user yang ditemukan");
    return;
  }
  
  result.rows.forEach((user: any, index: number) => {
    console.log(`${index + 1}. Username: ${user.username}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Dibuat: ${new Date(user.created_at).toLocaleString('id-ID')}`);
    console.log(`   Diupdate: ${new Date(user.updated_at).toLocaleString('id-ID')}`);
    console.log("");
  });
}

async function updateUser() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const question = (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  };
  
  try {
    const username = await question("Masukkan username yang akan diubah: ");
    
    if (!username.trim()) {
      console.log("❌ Username tidak boleh kosong");
      rl.close();
      return;
    }
    
    // Check if user exists
    const existing = await query(
      `select id from app_user where username = $1`,
      [username]
    );
    
    if (existing.rows.length === 0) {
      console.log(`❌ User ${username} tidak ditemukan`);
      rl.close();
      return;
    }
    
    const newUsername = await question("Masukkan username baru (kosongkan jika tidak ingin mengubah): ");
    const newPassword = await question("Masukkan password baru (kosongkan jika tidak ingin mengubah): ");
    const newRole = await question("Masukkan role baru (admin/teacher/user, kosongkan jika tidak ingin mengubah): ");
    
    let updateQuery = "update app_user set updated_at = now()";
    const params: any[] = [];
    let paramIndex = 1;
    
    if (newUsername.trim()) {
      updateQuery += `, username = $${paramIndex}`;
      params.push(newUsername.trim());
      paramIndex++;
    }
    
    if (newPassword.trim()) {
      updateQuery += `, password_hash = crypt($${paramIndex}, gen_salt('bf'))`;
      params.push(newPassword.trim());
      paramIndex++;
    }
    
    if (newRole.trim()) {
      updateQuery += `, role = $${paramIndex}`;
      params.push(newRole.trim());
      paramIndex++;
    }
    
    updateQuery += ` where username = $${paramIndex}`;
    params.push(username);
    
    await query(updateQuery, params);
    
    console.log(`✅ User ${username} berhasil diupdate`);
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    rl.close();
  }
}

async function createUser() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const question = (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  };
  
  try {
    const username = await question("Masukkan username baru: ");
    const password = await question("Masukkan password: ");
    const role = await question("Masukkan role (admin/teacher/user): ");
    
    if (!username.trim() || !password.trim()) {
      console.log("❌ Username dan password tidak boleh kosong");
      rl.close();
      return;
    }
    
    // Check if user exists
    const existing = await query(
      `select id from app_user where username = $1`,
      [username]
    );
    
    if (existing.rows.length > 0) {
      console.log(`❌ User ${username} sudah ada`);
      rl.close();
      return;
    }
    
    await query(
      `insert into app_user (username, password_hash, role) 
       values ($1, crypt($2, gen_salt('bf')), $3)`,
      [username, password, role || 'user']
    );
    
    console.log(`✅ User ${username} berhasil dibuat`);
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    rl.close();
  }
}

async function deleteUser() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const question = (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  };
  
  try {
    const username = await question("Masukkan username yang akan dihapus: ");
    
    if (!username.trim()) {
      console.log("❌ Username tidak boleh kosong");
      rl.close();
      return;
    }
    
    const result = await query(
      `delete from app_user where username = $1`,
      [username]
    );
    
    if (result.rows.length === 0) {
      console.log(`❌ User ${username} tidak ditemukan`);
    } else {
      console.log(`✅ User ${username} berhasil dihapus`);
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    rl.close();
  }
}

async function showMenu() {
  console.log("\n🔐 Admin Panel - Manajemen User Login");
  console.log("=" .repeat(40));
  console.log("1. Inisialisasi user default");
  console.log("2. Lihat daftar user");
  console.log("3. Ubah user");
  console.log("4. Tambah user baru");
  console.log("5. Hapus user");
  console.log("6. Keluar");
  console.log("=" .repeat(40));
}

async function main() {
  try {
    console.log("🚀 Menghubungkan ke database...");
    await ensureUserTable();
    console.log("✅ Terhubung ke database!");
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const question = (prompt: string): Promise<string> => {
      return new Promise((resolve) => {
        rl.question(prompt, resolve);
      });
    };
    
    while (true) {
      showMenu();
      const choice = await question("Pilih menu (1-6): ");
      
      switch (choice.trim()) {
        case '1':
          await initDefaultUsers();
          break;
        case '2':
          await listUsers();
          break;
        case '3':
          await updateUser();
          break;
        case '4':
          await createUser();
          break;
        case '5':
          await deleteUser();
          break;
        case '6':
          console.log("👋 Terima kasih!");
          rl.close();
          process.exit(0);
        default:
          console.log("❌ Pilihan tidak valid");
      }
      
      await question("\nTekan Enter untuk melanjutkan...");
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Run the script
if (require.main === module) {
  main();
}

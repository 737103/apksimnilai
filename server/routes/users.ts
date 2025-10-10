import type { RequestHandler } from "express";
import { query } from "../db";

// Ensure app_user table exists
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

// Create or update user
export const handleUpsertUser: RequestHandler = async (req, res) => {
  try {
    await ensureUserTable();
    
    const { username, password, role = 'user' } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        error: "Username dan password wajib diisi" 
      });
    }

    // Check if user exists
    const existingUser = await query(
      `select id from app_user where username = $1`,
      [username]
    );

    if (existingUser.rows.length > 0) {
      // Update existing user
      await query(
        `update app_user 
         set password_hash = crypt($1, gen_salt('bf')), 
             role = $2,
             updated_at = now()
         where username = $3`,
        [password, role, username]
      );
      
      res.json({ 
        success: true, 
        message: `User ${username} berhasil diupdate` 
      });
    } else {
      // Create new user
      await query(
        `insert into app_user (username, password_hash, role) 
         values ($1, crypt($2, gen_salt('bf')), $3)`,
        [username, password, role]
      );
      
      res.json({ 
        success: true, 
        message: `User ${username} berhasil dibuat` 
      });
    }
  } catch (err) {
    console.error("Error upserting user:", err);
    res.status(500).json({ 
      success: false, 
      error: "Terjadi kesalahan pada server" 
    });
  }
};

// Get all users
export const handleGetAllUsers: RequestHandler = async (req, res) => {
  try {
    await ensureUserTable();
    
    const result = await query(
      `select id, username, role, created_at, updated_at 
       from app_user 
       order by created_at desc`
    );
    
    res.json({ 
      success: true, 
      users: result.rows 
    });
  } catch (err) {
    console.error("Error getting users:", err);
    res.status(500).json({ 
      success: false, 
      error: "Terjadi kesalahan pada server" 
    });
  }
};

// Delete user
export const handleDeleteUser: RequestHandler = async (req, res) => {
  try {
    await ensureUserTable();
    
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ 
        success: false, 
        error: "Username wajib diisi" 
      });
    }

    const result = await query(
      `delete from app_user where username = $1`,
      [username]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ 
        success: false, 
        error: "User tidak ditemukan" 
      });
    }
    
    res.json({ 
      success: true, 
      message: `User ${username} berhasil dihapus` 
    });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ 
      success: false, 
      error: "Terjadi kesalahan pada server" 
    });
  }
};

// Initialize default users
export const handleInitUsers: RequestHandler = async (req, res) => {
  try {
    await ensureUserTable();
    
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
      }
    }
    
    res.json({ 
      success: true, 
      message: "Default users berhasil diinisialisasi" 
    });
  } catch (err) {
    console.error("Error initializing users:", err);
    res.status(500).json({ 
      success: false, 
      error: "Terjadi kesalahan pada server" 
    });
  }
};

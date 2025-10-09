import type { RequestHandler } from "express";
import { query } from "../db";
import type { LoginRequest, LoginResponse } from "@shared/api";

export const handleLogin: RequestHandler = async (req, res) => {
  const body = req.body as LoginRequest | undefined;
  if (!body || !body.username || !body.password) {
    const response: LoginResponse = { success: false, error: "Username dan password wajib diisi" };
    res.status(400).json(response);
    return;
  }

  try {
    // Ensure pgcrypto is available for crypt() usage on Neon
    await query(`create extension if not exists pgcrypto;`);

    const sql = `
      select id, username, role
      from app_user
      where username = $1
        and password_hash = crypt($2, password_hash)
      limit 1
    `;
    const { rows } = await query<{ id: string; username: string; role: string }>(sql, [body.username, body.password]);

    if (rows.length === 0) {
      const response: LoginResponse = { success: false, error: "Username atau password salah" };
      res.status(401).json(response);
      return;
    }

    const user = rows[0];
    const response: LoginResponse = {
      success: true,
      user: { id: user.id, username: user.username, role: user.role },
    };
    res.json(response);
  } catch (err) {
    const response: LoginResponse = { success: false, error: "Terjadi kesalahan pada server" };
    res.status(500).json(response);
  }
};



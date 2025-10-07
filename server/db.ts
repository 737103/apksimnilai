import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // Intentionally throw early to reveal missing configuration during startup
  throw new Error("DATABASE_URL is not set in environment variables");
}

export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

export async function query<T = unknown>(text: string, params?: unknown[]): Promise<{ rows: T[] }>{
  return pool.query<T>(text, params as any);
}



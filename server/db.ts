import { Pool } from "pg";

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;

    if (connectionString) {
      // Prefer connection string if provided (e.g. Netlify env var), keep SSL on Neon
      pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false },
        max: 3,
        idleTimeoutMillis: 10_000,
        connectionTimeoutMillis: 10_000,
      });
      console.log("Connecting to database via connection string (env)");
    } else {
      // Fallback to explicit Neon credentials
      const config = {
        host: 'ep-ancient-dawn-a19vr88t-pooler.ap-southeast-1.aws.neon.tech',
        port: 5432,
        database: 'neondb',
        user: 'neondb_owner',
        password: 'npg_Xu9mTPqUN0tE',
        ssl: { rejectUnauthorized: false },
        max: 3,
        idleTimeoutMillis: 10_000,
        connectionTimeoutMillis: 10_000,
      } as const;

      console.log("Connecting to database with config:", {
        host: config.host,
        port: config.port,
        database: config.database,
        user: config.user,
        password: '***'
      });

      pool = new Pool(config);
    }
  }
  return pool;
}

export async function query<T = unknown>(text: string, params?: unknown[]): Promise<{ rows: T[] }>{
  return getPool().query<T>(text, params as any);
}



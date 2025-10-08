import { Pool } from "pg";

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    // Use individual connection parameters instead of connection string
    const config = {
      host: 'ep-ancient-dawn-a19vr88t-pooler.ap-southeast-1.aws.neon.tech',
      port: 5432,
      database: 'neondb',
      user: 'neondb_owner',
      password: 'npg_Xu9mTPqUN0tE',
      ssl: { rejectUnauthorized: false }
    };
    
    console.log("Connecting to database with config:", {
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: '***'
    });
    
    pool = new Pool(config);
  }
  return pool;
}

export async function query<T = unknown>(text: string, params?: unknown[]): Promise<{ rows: T[] }>{
  return getPool().query<T>(text, params as any);
}



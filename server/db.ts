import { Pool } from "pg";

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;

    if (connectionString) {
      // Sanitize and parse connection string to avoid unsupported options in Node pg
      let url: URL;
      let raw = connectionString.trim();
      // Extract actual URL if env accidentally includes full psql command
      try {
        const idxPg = Math.max(raw.indexOf("postgresql://"), raw.indexOf("postgres://"));
        if (idxPg >= 0) raw = raw.slice(idxPg);
        if ((raw.startsWith("'") && raw.endsWith("'")) || (raw.startsWith('"') && raw.endsWith('"'))) {
          raw = raw.slice(1, -1);
        }
      } catch {}
      try {
        url = new URL(raw);
      } catch {
        // Fallback: let pg parse it if URL ctor fails
        pool = new Pool({
          connectionString: raw,
          ssl: { rejectUnauthorized: false },
          max: 3,
          idleTimeoutMillis: 10_000,
          connectionTimeoutMillis: 10_000,
        });
        console.log("Connecting to database via connection string (env, raw)");
        return pool;
      }

      // Remove options not used by node-postgres (e.g., channel_binding)
      url.searchParams.delete("channel_binding");
      const sanitized = url.toString();

      pool = new Pool({
        connectionString: sanitized,
        ssl: { rejectUnauthorized: false },
        max: 3,
        idleTimeoutMillis: 10_000,
        connectionTimeoutMillis: 10_000,
      });
      console.log("Connecting to database via connection string (env, sanitized)");
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



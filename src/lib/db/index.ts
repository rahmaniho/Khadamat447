/**
 * لایه دسترسی به پایگاه داده
 * ---------------------------------------------------------------
 * یک لایه نازک و بدون وابستگی اضافه که دو درایور را پشتیبانی می‌کند:
 *   ۱) SQLite (پیش‌فرض، بدون نیاز به نصب سرویس) با ماژول داخلی node:sqlite
 *   ۲) PostgreSQL با کتابخانه pg (برای محیط عملیاتی)
 * انتخاب درایور بر اساس DATABASE_URL انجام می‌شود:
 *   postgres://user:pass@host:5432/db  ->  PostgreSQL
 *   sqlite:/abs/path/file.db یا خالی    ->  SQLite
 * تمام کوئری‌ها پارامتری هستند (محافظت در برابر تزریق SQL).
 * جای‌نماها همیشه با «?» نوشته می‌شوند و درایور PostgreSQL آن‌ها را به $n تبدیل می‌کند.
 */
import fs from "node:fs";
import path from "node:path";

export type Dialect = "sqlite" | "postgres";
export type Row = Record<string, unknown>;
export type Param = string | number | boolean | null | undefined | Date;

export interface Tx {
  all<T = Row>(sql: string, params?: Param[]): Promise<T[]>;
  get<T = Row>(sql: string, params?: Param[]): Promise<T | undefined>;
  run(sql: string, params?: Param[]): Promise<void>;
}

interface Driver extends Tx {
  dialect: Dialect;
  exec(sql: string): Promise<void>;
  tx<T>(fn: (t: Tx) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

/* ----------------------------- ابزارها ----------------------------- */

const SCHEMA_FILE = path.join(process.cwd(), "src", "lib", "db", "schema.sql");

function toPg(sql: string): string {
  if (!sql.includes("?")) return sql;
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

function norm(params: Param[] = []): unknown[] {
  return params.map((p) => {
    if (p === undefined) return null;
    if (typeof p === "boolean") return p ? 1 : 0;
    if (p instanceof Date) return p.toISOString();
    return p;
  });
}

function sqlitePath(): string {
  const url = process.env.DATABASE_URL || "";
  if (url.startsWith("sqlite:")) return url.replace(/^sqlite:/, "");
  if (url) return url;
  return path.join(process.cwd(), ".data", "khadamat447.db");
}

/* ----------------------------- SQLite ------------------------------ */

type DatabaseSyncCtor = new (p: string, o?: Record<string, unknown>) => {
  prepare(sql: string): {
    all(...p: unknown[]): unknown[];
    get(...p: unknown[]): unknown;
    run(...p: unknown[]): unknown;
  };
  exec(sql: string): void;
  close(): void;
};

class SqliteDriver implements Driver {
  dialect: Dialect = "sqlite";
  private db: InstanceType<DatabaseSyncCtor>;
  constructor(db: InstanceType<DatabaseSyncCtor>) {
    this.db = db;
  }

  async all<T = Row>(sql: string, params: Param[] = []): Promise<T[]> {
    const rows = this.db.prepare(sql).all(...norm(params)) as Row[];
    return rows.map((r) => ({ ...r })) as T[];
  }
  async get<T = Row>(sql: string, params: Param[] = []): Promise<T | undefined> {
    const row = this.db.prepare(sql).get(...norm(params));
    return row === undefined || row === null ? undefined : ({ ...(row as Row) } as T);
  }
  async run(sql: string, params: Param[] = []): Promise<void> {
    this.db.prepare(sql).run(...norm(params));
  }
  async exec(sql: string): Promise<void> {
    this.db.exec(sql);
  }
  async tx<T>(fn: (t: Tx) => Promise<T>): Promise<T> {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const result = await fn(this);
      this.db.exec("COMMIT");
      return result;
    } catch (e) {
      try {
        this.db.exec("ROLLBACK");
      } catch {
        /* ignore */
      }
      throw e;
    }
  }
  async close(): Promise<void> {
    this.db.close();
  }
}

/* ---------------------------- PostgreSQL --------------------------- */

type PgPoolLike = {
  query(s: string, p?: unknown[]): Promise<{ rows: Row[]; rowCount: number | null }>;
  connect(): Promise<unknown>;
  end(): Promise<void>;
};

class PostgresDriver implements Driver {
  dialect: Dialect = "postgres";
  private pool: PgPoolLike;
  constructor(pool: PgPoolLike) {
    this.pool = pool;
  }

  async all<T = Row>(sql: string, params: Param[] = []): Promise<T[]> {
    const res = await this.pool.query(toPg(sql), norm(params));
    return res.rows as T[];
  }
  async get<T = Row>(sql: string, params: Param[] = []): Promise<T | undefined> {
    const res = await this.pool.query(toPg(sql), norm(params));
    return (res.rows[0] as T) ?? undefined;
  }
  async run(sql: string, params: Param[] = []): Promise<void> {
    await this.pool.query(toPg(sql), norm(params));
  }
  async exec(sql: string): Promise<void> {
    await this.pool.query(sql);
  }
  async tx<T>(fn: (t: Tx) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    const c = client as { query(s: string, p?: unknown[]): Promise<{ rows: Row[] }>; release(): void };
    await c.query("BEGIN");
    const local: Tx = {
      all: async <T2 = Row>(sql: string, params: Param[] = []) => (await c.query(toPg(sql), norm(params))).rows as T2[],
      get: async <T2 = Row>(sql: string, params: Param[] = []) => ((await c.query(toPg(sql), norm(params))).rows[0] as T2) ?? undefined,
      run: async (sql: string, params: Param[] = []) => {
        await c.query(toPg(sql), norm(params));
      },
    };
    try {
      const result = await fn(local);
      await c.query("COMMIT");
      return result;
    } catch (e) {
      await c.query("ROLLBACK");
      throw e;
    } finally {
      c.release();
    }
  }
  async close(): Promise<void> {
    await this.pool.end();
  }
}

/* ------------------------------ راه‌اندازی ---------------------------- */

interface GlobalDb {
  driver: Driver | null;
  initPromise: Promise<Driver> | null;
}
const g = globalThis as unknown as { __khadamat447db?: GlobalDb };
if (!g.__khadamat447db) g.__khadamat447db = { driver: null, initPromise: null };

function splitStatements(sql: string): string[] {
  const withoutComments = sql
    .split(/\r?\n/)
    .filter((line) => !line.trimStart().startsWith("--"))
    .join("\n");
  return withoutComments
    .split(/;\s*(?:\r?\n|$)/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

async function createDriver(): Promise<Driver> {
  const url = process.env.DATABASE_URL || "";
  if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
    const { default: pg } = await import("pg");
    const pool = new pg.Pool({
      connectionString: url,
      max: Number(process.env.PG_POOL_MAX || 8),
      ssl: process.env.PG_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    });
    const driver = new PostgresDriver(pool as unknown as PgPoolLike);
    await driver.exec("SET TIME ZONE 'UTC'");
    return driver;
  }

  const file = sqlitePath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const { DatabaseSync } = (await import("node:sqlite")) as unknown as { DatabaseSync: DatabaseSyncCtor };
  const db = new DatabaseSync(file, { enableForeignKeyConstraints: true });
  const driver = new SqliteDriver(db);
  await driver.exec("PRAGMA journal_mode = WAL");
  await driver.exec("PRAGMA busy_timeout = 5000");
  await driver.exec("PRAGMA foreign_keys = ON");
  return driver;
}

export async function getDriver(): Promise<Driver> {
  if (g.__khadamat447db!.driver) return g.__khadamat447db!.driver;
  if (!g.__khadamat447db!.initPromise) {
    g.__khadamat447db!.initPromise = (async () => {
      const driver = await createDriver();
      const schema = fs.readFileSync(SCHEMA_FILE, "utf8");
      for (const stmt of splitStatements(schema)) {
        await driver.exec(stmt);
      }
      g.__khadamat447db!.driver = driver;
      return driver;
    })().catch((e) => {
      g.__khadamat447db!.initPromise = null;
      throw e;
    });
  }
  return g.__khadamat447db!.initPromise!;
}

export async function all<T = Row>(sql: string, params: Param[] = []): Promise<T[]> {
  return (await getDriver()).all<T>(sql, params);
}
export async function get<T = Row>(sql: string, params: Param[] = []): Promise<T | undefined> {
  return (await getDriver()).get<T>(sql, params);
}
export async function run(sql: string, params: Param[] = []): Promise<void> {
  return (await getDriver()).run(sql, params);
}
export async function tx<T>(fn: (t: Tx) => Promise<T>): Promise<T> {
  return (await getDriver()).tx(fn);
}
export async function dialect(): Promise<Dialect> {
  return (await getDriver()).dialect;
}

/* --------------------- تبدیل نوع ستون‌ها --------------------- */

export const asBool = (v: unknown): boolean => v === true || v === 1 || v === "1" || v === "true";
export const asNumber = (v: unknown, fallback = 0): number => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
};
export const asText = (v: unknown): string => (v === null || v === undefined ? "" : String(v));
export function asJson<T>(v: unknown, fallback: T): T {
  if (v === null || v === undefined || v === "") return fallback;
  if (typeof v !== "string") return v as T;
  try {
    return JSON.parse(v) as T;
  } catch {
    return fallback;
  }
}
export const nowIso = (): string => new Date().toISOString();

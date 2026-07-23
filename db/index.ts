import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

type RuntimeBindings = {
  DB: D1Database;
  RECEIPTS?: R2Bucket;
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
};

export function getBindings(): RuntimeBindings {
  return env as unknown as RuntimeBindings;
}

export function getDb() {
  const { DB } = getBindings();
  if (!DB) {
    throw new Error("Cloudflare D1 binding `DB` is unavailable.");
  }
  return drizzle(DB, { schema });
}

export async function ensureSchema() {
  const { DB } = getBindings();
  await DB.batch([
    DB.prepare(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      business_name TEXT NOT NULL,
      business_type TEXT NOT NULL,
      phone TEXT,
      created_at INTEGER NOT NULL
    )`),
    DB.prepare(`CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    )`),
    DB.prepare(`CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      merchant TEXT NOT NULL,
      receipt_number TEXT,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      account TEXT NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      tax_amount REAL NOT NULL DEFAULT 0,
      payment_method TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'confirmed',
      receipt_key TEXT,
      ai_confidence REAL NOT NULL DEFAULT 0.92,
      created_at INTEGER NOT NULL
    )`),
    DB.prepare(`CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      month TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )`),
    DB.prepare(`CREATE TABLE IF NOT EXISTS registration_verifications (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      business_name TEXT NOT NULL,
      business_type TEXT NOT NULL,
      phone TEXT,
      code_hash TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      last_sent_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    )`),
    DB.prepare(`CREATE TABLE IF NOT EXISTS receipt_items (
      id TEXT PRIMARY KEY,
      transaction_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      item_name TEXT NOT NULL,
      quantity REAL NOT NULL DEFAULT 1,
      unit_price REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL,
      created_at INTEGER NOT NULL
    )`),
    DB.prepare("CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id)"),
    DB.prepare("CREATE UNIQUE INDEX IF NOT EXISTS registration_verifications_email_idx ON registration_verifications(email)"),
    DB.prepare("CREATE INDEX IF NOT EXISTS transactions_user_date_idx ON transactions(user_id, date)"),
    DB.prepare("CREATE INDEX IF NOT EXISTS receipt_items_user_transaction_idx ON receipt_items(user_id, transaction_id)"),
    DB.prepare("CREATE UNIQUE INDEX IF NOT EXISTS budgets_user_month_category_idx ON budgets(user_id, month, category)"),
  ]);
}

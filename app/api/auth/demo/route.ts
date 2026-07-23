import { NextResponse } from "next/server";
import { createSession, hashPassword } from "@/app/lib/auth";
import { seedDemoTransactions } from "@/app/lib/seed";
import { ensureSchema, getBindings } from "@/db";

export async function POST() {
  await ensureSchema();
  const { DB } = getBindings();
  const email = "demo@smartcash.ai";
  let user = await DB.prepare("SELECT id FROM users WHERE email = ?")
    .bind(email)
    .first<{ id: string }>();

  if (!user) {
    const id = crypto.randomUUID();
    const credentials = await hashPassword("DemoSmartCash2026!");
    await DB.prepare(
      `INSERT INTO users (
        id, full_name, email, password_hash, password_salt,
        business_name, business_type, phone, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        id,
        "Nur Shazween",
        email,
        credentials.hash,
        credentials.salt,
        "Shazween Enterprise",
        "Kedai Runcit",
        "012-3456789",
        Date.now(),
      )
      .run();
    user = { id };
  }

  await seedDemoTransactions(user.id);
  await createSession(user.id);
  return NextResponse.json({ ok: true });
}

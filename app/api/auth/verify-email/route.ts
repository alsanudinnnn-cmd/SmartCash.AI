import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/app/lib/auth";
import { hashVerificationCode } from "@/app/lib/email-verification";
import { ensureSchema, getBindings } from "@/db";

const MAX_ATTEMPTS = 5;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const email = String(body.email ?? "").trim().toLowerCase();
  const code = String(body.code ?? "").trim();
  if (!email || !/^\d{6}$/.test(code)) return NextResponse.json({ error: "Masukkan kod 6 digit yang sah." }, { status: 400 });

  await ensureSchema();
  const { DB } = getBindings();
  const pending = await DB.prepare(
    `SELECT id, full_name, email, password_hash, password_salt, business_name, business_type,
      phone, code_hash, expires_at, attempts
     FROM registration_verifications WHERE email = ?`,
  ).bind(email).first<PendingRegistration>();

  if (!pending || Number(pending.expires_at) <= Date.now()) {
    if (pending) await DB.prepare("DELETE FROM registration_verifications WHERE id = ?").bind(pending.id).run();
    return NextResponse.json({ error: "Kod telah tamat tempoh. Hantar kod baharu untuk meneruskan." }, { status: 400 });
  }
  if (Number(pending.attempts) >= MAX_ATTEMPTS) {
    return NextResponse.json({ error: "Terlalu banyak cubaan. Hantar kod baharu untuk meneruskan." }, { status: 429 });
  }
  if (await hashVerificationCode(email, code) !== pending.code_hash) {
    await DB.prepare("UPDATE registration_verifications SET attempts = attempts + 1 WHERE id = ?").bind(pending.id).run();
    return NextResponse.json({ error: "Kod pengesahan tidak tepat. Sila cuba lagi." }, { status: 400 });
  }

  const userId = crypto.randomUUID();
  const now = Date.now();
  try {
    await DB.batch([
      DB.prepare(`INSERT INTO users (id, full_name, email, password_hash, password_salt, business_name, business_type, phone, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(userId, pending.full_name, pending.email, pending.password_hash, pending.password_salt, pending.business_name, pending.business_type, pending.phone, now),
      DB.prepare("DELETE FROM registration_verifications WHERE id = ?").bind(pending.id),
    ]);
  } catch {
    return NextResponse.json({ error: "E-mel ini telah didaftarkan. Sila log masuk." }, { status: 409 });
  }
  await createSession(userId);
  return NextResponse.json({ ok: true });
}

type PendingRegistration = {
  id: string; full_name: string; email: string; password_hash: string; password_salt: string;
  business_name: string; business_type: string; phone: string | null; code_hash: string;
  expires_at: number; attempts: number;
};

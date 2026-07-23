import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/app/lib/auth";
import { generateVerificationCode, hashVerificationCode, sendVerificationEmail } from "@/app/lib/email-verification";
import { ensureSchema, getBindings } from "@/db";

const RESEND_WAIT_MS = 60_000;
const CODE_EXPIRY_MS = 10 * 60_000;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const fullName = String(body.fullName ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const businessName = String(body.businessName ?? "").trim();
  const businessType = String(body.businessType ?? "").trim();
  const phone = String(body.phone ?? "").trim();

  if (!fullName || !isEmail(email) || !businessName || !businessType || password.length < 8) {
    return NextResponse.json({ error: "Lengkapkan semua medan dengan e-mel yang sah dan kata laluan sekurang-kurangnya 8 aksara." }, { status: 400 });
  }

  await ensureSchema();
  const { DB } = getBindings();
  const existingUser = await DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
  if (existingUser) return NextResponse.json({ error: "E-mel ini telah didaftarkan. Sila log masuk." }, { status: 409 });

  const now = Date.now();
  const previous = await DB.prepare("SELECT last_sent_at FROM registration_verifications WHERE email = ?").bind(email).first<{ last_sent_at: number }>();
  const remaining = previous ? RESEND_WAIT_MS - (now - Number(previous.last_sent_at)) : 0;
  if (remaining > 0) {
    return NextResponse.json({ error: `Sila tunggu ${Math.ceil(remaining / 1000)} saat sebelum menghantar semula kod.` }, { status: 429 });
  }

  const code = generateVerificationCode();
  const credentials = await hashPassword(password);
  try {
    await sendVerificationEmail(email, code);
  } catch (error) {
    const message = error instanceof Error && error.message === "EMAIL_NOT_CONFIGURED"
      ? "Pengesahan e-mel belum dikonfigurasikan. Tambahkan tetapan Resend pada pelayan."
      : "Kod pengesahan tidak dapat dihantar. Sila cuba lagi.";
    return NextResponse.json({ error: message }, { status: 503 });
  }

  await DB.prepare(
    `INSERT INTO registration_verifications (
      id, full_name, email, password_hash, password_salt, business_name, business_type,
      phone, code_hash, expires_at, attempts, last_sent_at, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
    ON CONFLICT(email) DO UPDATE SET
      full_name = excluded.full_name, password_hash = excluded.password_hash,
      password_salt = excluded.password_salt, business_name = excluded.business_name,
      business_type = excluded.business_type, phone = excluded.phone,
      code_hash = excluded.code_hash, expires_at = excluded.expires_at,
      attempts = 0, last_sent_at = excluded.last_sent_at, created_at = excluded.created_at`,
  ).bind(
    crypto.randomUUID(), fullName, email, credentials.hash, credentials.salt,
    businessName, businessType, phone || null, await hashVerificationCode(email, code),
    now + CODE_EXPIRY_MS, now, now,
  ).run();

  return NextResponse.json({ ok: true, email, expiresInSeconds: CODE_EXPIRY_MS / 1000 });
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

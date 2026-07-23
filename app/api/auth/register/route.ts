import { NextRequest, NextResponse } from "next/server";
import { createSession, hashPassword } from "@/app/lib/auth";
import { ensureSchema, getBindings } from "@/db";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const fullName = String(body.fullName ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const businessName = String(body.businessName ?? "").trim();
  const businessType = String(body.businessType ?? "").trim();
  const phone = String(body.phone ?? "").trim();

  if (!fullName || !email || !businessName || !businessType || password.length < 8) {
    return NextResponse.json(
      { error: "Lengkapkan semua medan dan gunakan kata laluan sekurang-kurangnya 8 aksara." },
      { status: 400 },
    );
  }

  await ensureSchema();
  const { DB } = getBindings();
  const existing = await DB.prepare("SELECT id FROM users WHERE email = ?")
    .bind(email)
    .first();
  if (existing) {
    return NextResponse.json(
      { error: "E-mel ini telah didaftarkan. Sila log masuk." },
      { status: 409 },
    );
  }

  const userId = crypto.randomUUID();
  const credentials = await hashPassword(password);
  await DB.prepare(
    `INSERT INTO users (
      id, full_name, email, password_hash, password_salt,
      business_name, business_type, phone, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      userId,
      fullName,
      email,
      credentials.hash,
      credentials.salt,
      businessName,
      businessType,
      phone || null,
      Date.now(),
    )
    .run();

  await createSession(userId);
  return NextResponse.json({ ok: true });
}

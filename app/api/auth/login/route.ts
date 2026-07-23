import { NextRequest, NextResponse } from "next/server";
import { createSession, verifyPassword } from "@/app/lib/auth";
import { ensureSchema, getBindings } from "@/db";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  await ensureSchema();
  const user = await getBindings().DB.prepare(
    "SELECT id, password_hash, password_salt FROM users WHERE email = ?",
  )
    .bind(email)
    .first<{ id: string; password_hash: string; password_salt: string }>();

  if (!user || !(await verifyPassword(password, user.password_salt, user.password_hash))) {
    return NextResponse.json(
      { error: "E-mel atau kata laluan tidak betul." },
      { status: 401 },
    );
  }

  await createSession(user.id);
  return NextResponse.json({ ok: true });
}

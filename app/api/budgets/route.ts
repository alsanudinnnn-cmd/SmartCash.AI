import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/auth";
import {
  getBudgets,
  isBudgetCategory,
  isValidMonth,
} from "@/app/lib/budgets";
import { ensureSchema, getBindings } from "@/db";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sila log masuk semula." }, { status: 401 });
  }

  const month = request.nextUrl.searchParams.get("month") ?? "";
  if (!isValidMonth(month)) {
    return NextResponse.json({ error: "Bulan tidak sah." }, { status: 400 });
  }

  return NextResponse.json({ budgets: await getBudgets(user.id, month) });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sila log masuk semula." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    month?: unknown;
    category?: unknown;
    amount?: unknown;
  } | null;
  const month = typeof body?.month === "string" ? body.month.trim() : "";
  const category = typeof body?.category === "string" ? body.category.trim() : "";
  const amount = typeof body?.amount === "number" ? body.amount : Number(body?.amount);

  if (!isValidMonth(month)) {
    return NextResponse.json({ error: "Sila pilih bulan yang sah." }, { status: 400 });
  }
  if (!isBudgetCategory(category)) {
    return NextResponse.json({ error: "Sila pilih kategori bajet yang sah." }, { status: 400 });
  }
  if (!Number.isFinite(amount) || amount <= 0 || amount > 100_000_000) {
    return NextResponse.json({ error: "Jumlah bajet mestilah lebih daripada RM0." }, { status: 400 });
  }

  await ensureSchema();
  const now = Date.now();
  await getBindings().DB.prepare(
    `INSERT INTO budgets (id, user_id, month, category, amount, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id, month, category)
     DO UPDATE SET amount = excluded.amount, updated_at = excluded.updated_at`,
  )
    .bind(crypto.randomUUID(), user.id, month, category, amount, now, now)
    .run();

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/auth";
import { BUDGET_CATEGORIES, type BudgetCategory } from "@/app/lib/budget-config";
import { accountForCategory } from "@/app/lib/gemini-receipt";
import { ensureSchema, getBindings } from "@/db";

const PAYMENT_METHODS = new Set(["Tunai", "Bank", "Kad", "E-dompet"]);

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sesi anda telah tamat." }, { status: 401 });

  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) {
    return NextResponse.json({ error: "Maklumat transaksi tidak sah." }, { status: 400 });
  }

  if (body.status === "confirmed") {
    const merchant = cleanText(body.merchant, 120);
    const date = cleanText(body.date, 10);
    const amount = Number(body.amount);
    const taxAmount = Number(body.taxAmount);
    const paymentMethod = cleanText(body.paymentMethod, 30);
    const category = cleanText(body.category, 60);
    const description = cleanText(body.description, 180);

    if (!merchant) {
      return NextResponse.json({ error: "Nama peniaga diperlukan." }, { status: 400 });
    }
    if (!/^\d{4}-(0[1-9]|1[0-2])-([0-2]\d|3[01])$/.test(date)) {
      return NextResponse.json({ error: "Tarikh transaksi tidak sah." }, { status: 400 });
    }
    if (!Number.isFinite(amount) || amount <= 0 || amount > 100_000_000) {
      return NextResponse.json({ error: "Jumlah transaksi tidak sah." }, { status: 400 });
    }
    if (!Number.isFinite(taxAmount) || taxAmount < 0 || taxAmount > amount) {
      return NextResponse.json({ error: "Jumlah cukai tidak sah." }, { status: 400 });
    }
    if (!PAYMENT_METHODS.has(paymentMethod)) {
      return NextResponse.json({ error: "Kaedah bayaran tidak sah." }, { status: 400 });
    }
    if (!BUDGET_CATEGORIES.includes(category as BudgetCategory)) {
      return NextResponse.json({ error: "Kategori transaksi tidak sah." }, { status: 400 });
    }
    if (!description) {
      return NextResponse.json({ error: "Keterangan transaksi diperlukan." }, { status: 400 });
    }

    const account = accountForCategory(category as BudgetCategory);
    await ensureSchema();
    await getBindings().DB.prepare(
      `UPDATE transactions
       SET merchant = ?, date = ?, amount = ?, tax_amount = ?,
           payment_method = ?, category = ?, account = ?,
           description = ?, status = 'confirmed'
       WHERE id = ? AND user_id = ?`,
    )
      .bind(
        merchant,
        date,
        Number(amount.toFixed(2)),
        Number(taxAmount.toFixed(2)),
        paymentMethod,
        category,
        account,
        description,
        id,
        user.id,
      )
      .run();

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json(
    { error: "Tiada perubahan untuk disimpan." },
    { status: 400 },
  );
}

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

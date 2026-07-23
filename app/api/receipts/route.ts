import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/auth";
import {
  accountForCategory,
  analyzeReceiptWithGemini,
} from "@/app/lib/gemini-receipt";
import { ensureSchema, getBindings } from "@/db";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sesi anda telah tamat." }, { status: 401 });

  const form = await request.formData();
  const file = form.get("receipt");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Sila pilih fail resit." }, { status: 400 });
  }
  if (!ACCEPTED_TYPES.has(file.type) || file.size === 0 || file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Gunakan resit JPG, PNG, WebP atau PDF yang tidak melebihi 10 MB." },
      { status: 400 },
    );
  }

  const { DB, RECEIPTS, GEMINI_API_KEY, GEMINI_MODEL } = getBindings();
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Gemini AI belum dikonfigurasikan. Tambahkan GEMINI_API_KEY pada pelayan." },
      { status: 503 },
    );
  }

  const merchantHint = String(form.get("merchant") ?? "").trim();
  const dateHint = String(form.get("date") ?? "").trim();
  const amountHint = Number(form.get("amount"));
  const paymentHint = String(form.get("paymentMethod") ?? "").trim();

  let analysis;
  try {
    analysis = await analyzeReceiptWithGemini({
      file,
      apiKey: GEMINI_API_KEY,
      model: GEMINI_MODEL,
      hints: {
        merchant: merchantHint || undefined,
        date: dateHint || undefined,
        amount: Number.isFinite(amountHint) && amountHint > 0 ? amountHint : undefined,
        paymentMethod: paymentHint || undefined,
      },
    });
  } catch (error) {
    console.error("Gemini receipt analysis failed:", error);
    return NextResponse.json(
      { error: "Gemini tidak dapat membaca resit ini. Pastikan imej jelas dan cuba semula." },
      { status: 422 },
    );
  }

  const merchant = merchantHint || analysis.merchant;
  const date = dateHint || analysis.date;
  const amount = Number.isFinite(amountHint) && amountHint > 0 ? amountHint : analysis.amount;
  const paymentMethod = paymentHint || (
    analysis.paymentMethod === "Tidak Diketahui" ? "Tunai" : analysis.paymentMethod
  );
  const account = accountForCategory(analysis.category);
  const id = crypto.randomUUID();
  const receiptKey = `${user.id}/${id}-${safeFilename(file.name)}`;

  if (RECEIPTS) {
    await RECEIPTS.put(receiptKey, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type },
      customMetadata: { owner: user.id, originalName: file.name },
    });
  }

  await ensureSchema();
  const createdAt = Date.now();
  const statements = [DB.prepare(
    `INSERT INTO transactions (
      id, user_id, date, merchant, receipt_number, description, category,
      account, type, amount, tax_amount, payment_method, status,
      receipt_key, ai_confidence, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'expense', ?, ?, ?, 'review', ?, ?, ?)`,
  )
    .bind(
      id,
      user.id,
      date,
      merchant,
      analysis.receiptNumber ?? `AI-${new Date().getFullYear()}-${id.slice(0, 6).toUpperCase()}`,
      analysis.description,
      analysis.category,
      account,
      amount,
      analysis.taxAmount,
      paymentMethod,
      receiptKey,
      analysis.confidence,
      createdAt,
    )];
  analysis.items.forEach((item) => {
    statements.push(DB.prepare(
      `INSERT INTO receipt_items (
        id, transaction_id, user_id, item_name, quantity, unit_price, total, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      crypto.randomUUID(),
      id,
      user.id,
      item.name,
      item.quantity,
      item.unitPrice,
      item.total,
      createdAt,
    ));
  });
  await DB.batch(statements);

  return NextResponse.json({
    id,
    merchant,
    date,
    amount,
    taxAmount: analysis.taxAmount,
    paymentMethod,
    category: analysis.category,
    account,
    description: analysis.description,
    confidence: analysis.confidence,
    analysisSource: "gemini",
    items: analysis.items,
  });
}

function safeFilename(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-80);
}

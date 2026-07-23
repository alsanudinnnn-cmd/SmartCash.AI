import { getBindings } from "@/db";

const demoTransactions = [
  ["2026-07-03", "Kedai Maju", "INV-2026-0711", "Belian stok inventori", "Pembelian Barang", "Inventori", "expense", 382.7, 22.96, "Tunai"],
  ["2026-07-05", "Pelanggan Runcit", "SL-2026-0155", "Jualan harian", "Jualan", "Hasil Jualan", "income", 2480, 0, "Kad"],
  ["2026-07-08", "TNB", "TNB-842910", "Bil elektrik premis", "Utiliti", "Belanja Utiliti", "expense", 286.4, 17.18, "Bank"],
  ["2026-07-12", "Pelanggan Borong", "SL-2026-0173", "Jualan pesanan borong", "Jualan", "Hasil Jualan", "income", 4250, 0, "Bank"],
  ["2026-07-16", "Maxis Business", "MX-2026-8127", "Internet dan telefon", "Utiliti", "Belanja Telekomunikasi", "expense", 168, 10.08, "Bank"],
  ["2026-07-19", "Pelanggan Runcit", "SL-2026-0192", "Jualan hujung minggu", "Jualan", "Hasil Jualan", "income", 3150, 0, "Tunai"],
];

export async function seedDemoTransactions(userId: string) {
  const { DB } = getBindings();
  const count = await DB.prepare(
    "SELECT COUNT(*) AS total FROM transactions WHERE user_id = ?",
  )
    .bind(userId)
    .first<{ total: number }>();
  if ((count?.total ?? 0) > 0) return;

  const now = Date.now();
  await DB.batch(
    demoTransactions.map((item, index) =>
      DB.prepare(
        `INSERT INTO transactions (
          id, user_id, date, merchant, receipt_number, description, category,
          account, type, amount, tax_amount, payment_method, status,
          receipt_key, ai_confidence, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', NULL, ?, ?)`,
      ).bind(
        crypto.randomUUID(),
        userId,
        ...item,
        0.9 + index * 0.01,
        now + index,
      ),
    ),
  );
}

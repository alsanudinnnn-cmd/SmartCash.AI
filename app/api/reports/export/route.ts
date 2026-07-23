import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/auth";
import { getTransactions } from "@/app/lib/data";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sesi anda telah tamat." }, { status: 401 });
  const format = request.nextUrl.searchParams.get("format") === "excel" ? "excel" : "csv";
  const transactions = await getTransactions(user.id);
  const delimiter = format === "excel" ? "\t" : ",";
  const rows = [
    ["Tarikh", "Peniaga", "Keterangan", "Kategori", "Jenis", "Jumlah (RM)", "SST (RM)", "Kaedah Bayaran"],
    ...transactions.map((item) => [
      item.date,
      item.merchant,
      item.description,
      item.category,
      item.type === "income" ? "Pendapatan" : "Perbelanjaan",
      item.amount.toFixed(2),
      item.taxAmount.toFixed(2),
      item.paymentMethod,
    ]),
  ];
  const content = rows.map((row) => row.map((value) => escapeCell(String(value), delimiter)).join(delimiter)).join("\n");
  const extension = format === "excel" ? "xls" : "csv";
  const type = format === "excel" ? "application/vnd.ms-excel" : "text/csv";
  return new NextResponse(`\uFEFF${content}`, {
    headers: {
      "content-type": `${type}; charset=utf-8`,
      "content-disposition": `attachment; filename="smartcash-transaksi.${extension}"`,
    },
  });
}

function escapeCell(value: string, delimiter: string) {
  if (!value.includes(delimiter) && !value.includes('"') && !value.includes("\n")) return value;
  return `"${value.replaceAll('"', '""')}"`;
}

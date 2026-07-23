import { ensureSchema, getBindings } from "@/db";

export type TransactionRecord = {
  id: string;
  date: string;
  merchant: string;
  receiptNumber: string | null;
  description: string;
  category: string;
  account: string;
  type: "income" | "expense";
  amount: number;
  taxAmount: number;
  paymentMethod: string;
  status: "review" | "confirmed";
  aiConfidence: number;
};

export async function getTransactions(userId: string): Promise<TransactionRecord[]> {
  await ensureSchema();
  const result = await getBindings().DB.prepare(
    `SELECT id, date, merchant, receipt_number, description, category, account,
      type, amount, tax_amount, payment_method, status, ai_confidence
     FROM transactions WHERE user_id = ? ORDER BY date DESC, created_at DESC`,
  )
    .bind(userId)
    .all<{
      id: string;
      date: string;
      merchant: string;
      receipt_number: string | null;
      description: string;
      category: string;
      account: string;
      type: "income" | "expense";
      amount: number;
      tax_amount: number;
      payment_method: string;
      status: "review" | "confirmed";
      ai_confidence: number;
    }>();

  return result.results.map((row: {
    id: string;
    date: string;
    merchant: string;
    receipt_number: string | null;
    description: string;
    category: string;
    account: string;
    type: "income" | "expense";
    amount: number;
    tax_amount: number;
    payment_method: string;
    status: "review" | "confirmed";
    ai_confidence: number;
  }) => ({
    id: row.id,
    date: row.date,
    merchant: row.merchant,
    receiptNumber: row.receipt_number,
    description: row.description,
    category: row.category,
    account: row.account,
    type: row.type,
    amount: row.amount,
    taxAmount: row.tax_amount,
    paymentMethod: row.payment_method,
    status: row.status,
    aiConfidence: row.ai_confidence,
  }));
}

export function summarizeTransactions(transactions: TransactionRecord[]) {
  const confirmed = transactions.filter((item) => item.status === "confirmed");
  const sales = confirmed
    .filter((item) => item.type === "income")
    .reduce((total, item) => total + item.amount, 0);
  const expenses = confirmed
    .filter((item) => item.type === "expense")
    .reduce((total, item) => total + item.amount, 0);
  return {
    sales,
    expenses,
    profit: sales - expenses,
    cash: sales - expenses,
    pending: transactions.filter((item) => item.status === "review").length,
  };
}

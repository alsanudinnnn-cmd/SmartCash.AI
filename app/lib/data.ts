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
  const cashIncome = confirmed
    .filter((item) => item.type === "income" && item.paymentMethod === "Tunai")
    .reduce((total, item) => total + item.amount, 0);
  const cashExpenses = confirmed
    .filter((item) => item.type === "expense" && item.paymentMethod === "Tunai")
    .reduce((total, item) => total + item.amount, 0);
  return {
    sales,
    expenses,
    profit: sales - expenses,
    cash: cashIncome - cashExpenses,
    confirmed: confirmed.length,
    pending: transactions.filter((item) => item.status === "review").length,
  };
}

export type CashFlowPeriod = {
  key: string;
  label: string;
  sales: number;
  expenses: number;
  net: number;
};

export function getCashFlowSeries(
  transactions: TransactionRecord[],
  periodCount = 6,
  referenceDate = new Date(),
): CashFlowPeriod[] {
  const formatter = new Intl.DateTimeFormat("ms-MY", {
    month: "short",
    timeZone: "UTC",
  });
  const periods = Array.from({ length: periodCount }, (_, index) => {
    const date = new Date(Date.UTC(
      referenceDate.getUTCFullYear(),
      referenceDate.getUTCMonth() - (periodCount - 1 - index),
      1,
    ));
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    return {
      key,
      label: formatter.format(date),
      sales: 0,
      expenses: 0,
      net: 0,
    };
  });
  const byMonth = new Map(periods.map((period) => [period.key, period]));

  transactions
    .filter((item) => item.status === "confirmed")
    .forEach((item) => {
      const period = byMonth.get(item.date.slice(0, 7));
      if (!period) return;
      if (item.type === "income") period.sales += item.amount;
      if (item.type === "expense") period.expenses += item.amount;
      period.net = period.sales - period.expenses;
    });

  return periods;
}

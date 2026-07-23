import { ensureSchema, getBindings } from "@/db";
import type { BudgetRecord } from "@/app/lib/budget-config";

export type ReceiptItem = {
  id: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

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
  items: ReceiptItem[];
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

  const itemResult = await getBindings().DB.prepare(
    `SELECT id, transaction_id, item_name, quantity, unit_price, total
     FROM receipt_items
     WHERE user_id = ?
     ORDER BY created_at ASC`,
  )
    .bind(userId)
    .all<{
      id: string;
      transaction_id: string;
      item_name: string;
      quantity: number;
      unit_price: number;
      total: number;
    }>();
  const itemsByTransaction = new Map<string, ReceiptItem[]>();
  itemResult.results.forEach((item) => {
    const items = itemsByTransaction.get(item.transaction_id) ?? [];
    items.push({
      id: item.id,
      itemName: item.item_name,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unit_price),
      total: Number(item.total),
    });
    itemsByTransaction.set(item.transaction_id, items);
  });

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
    items: itemsByTransaction.get(row.id) ?? [],
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

export type CashFlowGranularity = "day" | "week" | "month";

export function getCashFlowSeries(
  transactions: TransactionRecord[],
  budgets: BudgetRecord[],
  granularity: CashFlowGranularity = "month",
  referenceDate = new Date(),
): CashFlowPeriod[] {
  const today = new Date(Date.UTC(
    referenceDate.getUTCFullYear(),
    referenceDate.getUTCMonth(),
    referenceDate.getUTCDate(),
  ));
  const budgetByMonth = new Map<string, number>();
  budgets.forEach((budget) => {
    budgetByMonth.set(budget.month, (budgetByMonth.get(budget.month) ?? 0) + Number(budget.amount));
  });

  if (granularity === "month") {
    const formatter = new Intl.DateTimeFormat("ms-MY", { month: "short", timeZone: "UTC" });
    const periods = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - (5 - index), 1));
      const key = monthKey(date);
      return { key, label: formatter.format(date), sales: budgetByMonth.get(key) ?? 0, expenses: 0, net: 0 };
    });
    const byMonth = new Map(periods.map((period) => [period.key, period]));
    addExpenses(transactions, (transaction) => byMonth.get(transaction.date.slice(0, 7)));
    return finalizePeriods(periods);
  }

  const days = granularity === "day" ? 7 : 42;
  const start = addDays(today, -(days - 1));
  const buckets = granularity === "day"
    ? Array.from({ length: 7 }, (_, index) => {
      const date = addDays(start, index);
      return { key: dayKey(date), label: new Intl.DateTimeFormat("ms-MY", { day: "numeric", month: "short", timeZone: "UTC" }).format(date), sales: dailyBudget(date, budgetByMonth), expenses: 0, net: 0 };
    })
    : Array.from({ length: 6 }, (_, index) => {
      const bucketStart = addDays(start, index * 7);
      const bucketEnd = addDays(bucketStart, 6);
      return { key: dayKey(bucketStart), label: `${bucketStart.getUTCDate()}–${bucketEnd.getUTCDate()} ${new Intl.DateTimeFormat("ms-MY", { month: "short", timeZone: "UTC" }).format(bucketEnd)}`, sales: Array.from({ length: 7 }, (_, day) => dailyBudget(addDays(bucketStart, day), budgetByMonth)).reduce((total, amount) => total + amount, 0), expenses: 0, net: 0 };
    });
  const byKey = new Map(buckets.map((bucket) => [bucket.key, bucket]));
  addExpenses(transactions, (transaction) => {
    if (granularity === "day") return byKey.get(transaction.date);
    const date = new Date(`${transaction.date}T00:00:00Z`);
    const offset = Math.floor((date.getTime() - start.getTime()) / 86_400_000);
    return offset >= 0 && offset < 42 ? buckets[Math.floor(offset / 7)] : undefined;
  });
  return finalizePeriods(buckets);
}

function addExpenses(transactions: TransactionRecord[], findPeriod: (transaction: TransactionRecord) => CashFlowPeriod | undefined) {
  transactions.filter((item) => item.status === "confirmed" && item.type === "expense").forEach((item) => {
    const period = findPeriod(item);
    if (period) period.expenses += item.amount;
  });
}

function finalizePeriods(periods: CashFlowPeriod[]) {
  return periods.map((period) => ({ ...period, sales: round(period.sales), expenses: round(period.expenses), net: round(period.sales - period.expenses) }));
}

function dailyBudget(date: Date, budgetByMonth: Map<string, number>) {
  const daysInMonth = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  return (budgetByMonth.get(monthKey(date)) ?? 0) / daysInMonth;
}

function addDays(date: Date, days: number) { return new Date(date.getTime() + days * 86_400_000); }
function monthKey(date: Date) { return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`; }
function dayKey(date: Date) { return `${monthKey(date)}-${String(date.getUTCDate()).padStart(2, "0")}`; }
function round(value: number) { return Number(value.toFixed(2)); }

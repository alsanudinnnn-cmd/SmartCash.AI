import { ensureSchema, getBindings } from "@/db";
import {
  BUDGET_CATEGORIES,
  type BudgetCategory,
  type BudgetRecord,
  type SpendingByCategory,
} from "@/app/lib/budget-config";

export type { BudgetRecord, SpendingByCategory } from "@/app/lib/budget-config";

export async function getBudgets(userId: string, month: string): Promise<BudgetRecord[]> {
  await ensureSchema();
  const result = await getBindings().DB.prepare(
    `SELECT id, month, category, amount
     FROM budgets
     WHERE user_id = ? AND month = ?
     ORDER BY category ASC`,
  )
    .bind(userId, month)
    .all<BudgetRecord>();

  return result.results;
}

export async function getAllBudgets(userId: string): Promise<BudgetRecord[]> {
  await ensureSchema();
  const result = await getBindings().DB.prepare(
    `SELECT id, month, category, amount
     FROM budgets
     WHERE user_id = ?
     ORDER BY month ASC, category ASC`,
  )
    .bind(userId)
    .all<BudgetRecord>();

  return result.results;
}

export async function getMonthlySpending(
  userId: string,
  month: string,
): Promise<SpendingByCategory> {
  await ensureSchema();
  const result = await getBindings().DB.prepare(
    `SELECT category, SUM(amount) AS total
     FROM transactions
     WHERE user_id = ?
       AND type = 'expense'
       AND status = 'confirmed'
       AND substr(date, 1, 7) = ?
     GROUP BY category`,
  )
    .bind(userId, month)
    .all<{ category: string; total: number }>();

  return Object.fromEntries(
    result.results.map((row: { category: string; total: number }) => [
      row.category,
      Number(row.total),
    ]),
  );
}

export function isValidMonth(month: string) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(month);
}

export function isBudgetCategory(category: string): category is BudgetCategory {
  return BUDGET_CATEGORIES.includes(category as BudgetCategory);
}

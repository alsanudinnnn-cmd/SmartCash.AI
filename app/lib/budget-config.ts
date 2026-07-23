export const BUDGET_CATEGORIES = [
  "Pembelian Barang",
  "Utiliti",
  "Pengangkutan",
  "Bekalan Pejabat",
  "Pemasaran",
  "Sewa",
  "Gaji",
  "Lain-lain",
] as const;

export type BudgetCategory = (typeof BUDGET_CATEGORIES)[number];

export type BudgetRecord = {
  id: string;
  month: string;
  category: string;
  amount: number;
};

export type SpendingByCategory = Record<string, number>;

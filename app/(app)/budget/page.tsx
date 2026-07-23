import { BudgetManager } from "@/app/components/BudgetManager";
import { PageHeader } from "@/app/components/PageHeader";
import { requireUser } from "@/app/lib/auth";
import { getBudgets, getMonthlySpending, isValidMonth } from "@/app/lib/budgets";

export default async function BudgetPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const user = await requireUser("/budget");
  const requestedMonth = (await searchParams).month ?? "";
  const month = isValidMonth(requestedMonth)
    ? requestedMonth
    : new Date().toISOString().slice(0, 7);
  const [budgets, spendingByCategory] = await Promise.all([
    getBudgets(user.id, month),
    getMonthlySpending(user.id, month),
  ]);

  return (
    <main className="app-content">
      <PageHeader
        eyebrow="Perancangan kewangan"
        title="Bajet bulanan"
        description="Tetapkan had perbelanjaan dan pantau penggunaan sebenar untuk setiap kategori."
      />
      <BudgetManager
        month={month}
        initialBudgets={budgets}
        spendingByCategory={spendingByCategory}
      />
    </main>
  );
}

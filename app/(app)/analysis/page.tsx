import Link from "next/link";
import { CircleDollarSign, Percent, Sparkles, TrendingUp, TriangleAlert } from "lucide-react";
import { PageHeader } from "@/app/components/PageHeader";
import { getTransactions, summarizeTransactions } from "@/app/lib/data";
import { currency } from "@/app/lib/format";
import { requireUser } from "@/app/lib/auth";
import { getAllBudgets } from "@/app/lib/budgets";

export default async function AnalysisPage() {
  const user = await requireUser("/analysis");
  const [transactions, budgets] = await Promise.all([getTransactions(user.id), getAllBudgets(user.id)]);
  const transactionSummary = summarizeTransactions(transactions);
  const sales = budgets.reduce((total, budget) => total + Number(budget.amount), 0);
  const summary = { ...transactionSummary, sales, profit: sales - transactionSummary.expenses };
  const margin = summary.sales ? Math.round((summary.profit / summary.sales) * 100) : 0;
  const utility = transactions.filter((item) => item.category === "Utiliti").reduce((total, item) => total + item.amount, 0);
  return (
    <main className="app-content">
      <PageHeader
        eyebrow="Analisis AI"
        title="Insight untuk keputusan lebih baik"
        description="Cadangan berdasarkan corak dalam transaksi dan prestasi kewangan semasa."
      />
      {transactions.length || budgets.length ? (
        <section className="insight-grid">
          <article className="insight-card insight-primary">
            <span className="insight-symbol" aria-hidden="true"><TrendingUp size={23} strokeWidth={2} /></span>
            <div><span>Prestasi jualan</span><h2>Jumlah bajet jualan ialah {currency(summary.sales)}.</h2><p>Jumlah ini menggunakan bajet yang anda masukkan. Teruskan merekod perbelanjaan untuk insight yang lebih tepat.</p></div>
          </article>
          <article className="insight-card insight-warning">
            <span className="insight-symbol" aria-hidden="true"><TriangleAlert size={22} strokeWidth={2} /></span>
            <div><span>Kos operasi</span><h2>Utiliti menyumbang {currency(utility)} kepada perbelanjaan.</h2><p>Semak pelan elektrik, internet dan telefon jika kos ini terus meningkat.</p></div>
          </article>
          <article className="insight-card insight-secondary">
            <span className="insight-symbol" aria-hidden="true"><Percent size={22} strokeWidth={2} /></span>
            <div><span>Margin keuntungan</span><h2>Margin bersih semasa ialah {margin}%.</h2><p>{margin >= 25 ? "Prestasi yang baik. Kekalkan kawalan kos semasa." : "Pertimbangkan semakan harga atau pengurangan kos berubah."}</p></div>
          </article>
          <article className="insight-card insight-neutral">
            <span className="insight-symbol" aria-hidden="true"><CircleDollarSign size={23} strokeWidth={2} /></span>
            <div><span>Ramalan tunai</span><h2>Baki anggaran ialah {currency(summary.cash)}.</h2><p>Pastikan transaksi tertunggak disahkan sebelum membuat keputusan tunai utama.</p></div>
          </article>
        </section>
      ) : (
        <section className="panel empty-state">
          <span aria-hidden="true"><Sparkles size={22} strokeWidth={2} /></span>
          <h3>Belum cukup data untuk analisis</h3>
          <p>Tambah transaksi pertama anda untuk mendapatkan insight kewangan.</p>
          <Link className="primary-button link-button" href="/receipts">Imbas resit</Link>
        </section>
      )}
    </main>
  );
}

import Link from "next/link";
import {
  ArrowRight,
  BadgeDollarSign,
  ChartNoAxesCombined,
  FilePlus2,
  ReceiptText,
  ShoppingCart,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { PageHeader } from "@/app/components/PageHeader";
import {
  getCashFlowSeries,
  getTransactions,
  summarizeTransactions,
} from "@/app/lib/data";
import { currency } from "@/app/lib/format";
import { requireUser } from "@/app/lib/auth";

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const transactions = await getTransactions(user.id);
  const summary = summarizeTransactions(transactions);
  const cashFlow = getCashFlowSeries(transactions);
  const recent = transactions.slice(0, 5);
  const hasConfirmedData = summary.confirmed > 0;
  const hasCashFlowData = cashFlow.some((period) => period.sales > 0 || period.expenses > 0);
  const chartMaximum = Math.max(
    1,
    ...cashFlow.flatMap((period) => [period.sales, period.expenses]),
  );
  const chartDescription = cashFlow
    .map((period) => `${period.label}: jualan ${currency(period.sales)}, perbelanjaan ${currency(period.expenses)}`)
    .join("; ");

  return (
    <main className="app-content">
      <PageHeader
        eyebrow="Dashboard utama"
        title={`Selamat datang, ${user.fullName.split(" ")[0]}`}
        description={`Ringkasan keseluruhan kewangan ${user.businessName} berdasarkan transaksi yang telah disahkan.`}
        action={<Link className="primary-button link-button" href="/receipts">Imbas resit</Link>}
      />

      <section className="summary-grid" aria-label="Ringkasan kewangan">
        <article className="summary-card">
          <span className="summary-icon income-icon" aria-hidden="true"><ChartNoAxesCombined size={19} strokeWidth={2} /></span>
          <span className="summary-label">Jumlah jualan</span>
          <strong>{currency(summary.sales)}</strong>
          <small className="trend-positive">Keseluruhan hasil jualan disahkan</small>
        </article>
        <article className="summary-card">
          <span className="summary-icon expense-icon" aria-hidden="true"><ShoppingCart size={19} strokeWidth={2} /></span>
          <span className="summary-label">Jumlah perbelanjaan</span>
          <strong>{currency(summary.expenses)}</strong>
          <small>Keseluruhan kos yang telah disahkan</small>
        </article>
        <article className="summary-card">
          <span className="summary-icon profit-icon" aria-hidden="true"><BadgeDollarSign size={20} strokeWidth={2} /></span>
          <span className="summary-label">Untung bersih</span>
          <strong>{currency(summary.profit)}</strong>
          <small className={summary.profit >= 0 ? "trend-positive" : "trend-negative"}>
            Jualan tolak perbelanjaan
          </small>
        </article>
        <article className="summary-card">
          <span className="summary-icon cash-icon" aria-hidden="true"><WalletCards size={20} strokeWidth={2} /></span>
          <span className="summary-label">Baki tunai</span>
          <strong>{currency(summary.cash)}</strong>
          <small>Tunai masuk ditolak tunai keluar</small>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="panel chart-panel">
          <div className="panel-header">
            <div><h2>Aliran tunai</h2><p>Perbandingan enam tempoh terkini</p></div>
            <span className="period-chip">6 bulan</span>
          </div>
          {hasCashFlowData ? (
            <>
              <div
                className="cash-chart"
                role="img"
                aria-label={`Graf aliran tunai enam bulan. ${chartDescription}`}
              >
                {cashFlow.map((period) => (
                  <div className="chart-column" key={period.key}>
                    <span
                      className="bar-income"
                      title={`${period.label} · Jualan ${currency(period.sales)}`}
                      style={{
                        height: period.sales
                          ? `${Math.max(4, (period.sales / chartMaximum) * 100)}%`
                          : 0,
                      }}
                    />
                    <span
                      className="bar-expense"
                      title={`${period.label} · Perbelanjaan ${currency(period.expenses)}`}
                      style={{
                        height: period.expenses
                          ? `${Math.max(4, (period.expenses / chartMaximum) * 100)}%`
                          : 0,
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="chart-axis" aria-hidden="true">
                {cashFlow.map((period) => <span key={period.key}>{period.label}</span>)}
              </div>
              <div className="chart-legend">
                <span><i className="legend-income" /> Jualan</span>
                <span><i className="legend-expense" /> Perbelanjaan</span>
              </div>
            </>
          ) : (
            <div className="empty-state compact">
              <span aria-hidden="true"><FilePlus2 size={22} strokeWidth={2} /></span>
              <h3>Belum ada data untuk enam bulan ini</h3>
              <p>Rekod dan sahkan transaksi untuk membina graf aliran tunai.</p>
            </div>
          )}
        </article>

        <article className="panel ai-panel">
          <div className="ai-badge"><span aria-hidden="true"><Sparkles size={15} strokeWidth={2} /></span> Analisis pintar</div>
          <h2>
            {hasConfirmedData
              ? summary.profit >= 0
                ? "Prestasi kewangan anda berada pada landasan yang baik."
                : "Perbelanjaan anda melebihi jualan bulan ini."
              : "Mulakan dengan resit pertama anda."}
          </h2>
          <p>
            {hasConfirmedData
              ? `Margin anggaran semasa ialah ${summary.sales ? Math.round((summary.profit / summary.sales) * 100) : 0}%. Semak cadangan terperinci untuk langkah seterusnya.`
              : "SmartCash AI akan membina insight selepas transaksi pertama direkodkan."}
          </p>
          <Link className="text-link" href="/analysis">Lihat analisis penuh <ArrowRight size={15} aria-hidden="true" /></Link>
        </article>
      </section>

      <section className="panel recent-panel">
        <div className="panel-header">
          <div><h2>Transaksi terkini</h2><p>Rekod terbaru dalam akaun anda</p></div>
          <Link className="text-link" href="/transactions">Lihat semua</Link>
        </div>
        {recent.length ? (
          <div className="responsive-table">
            <table>
              <thead><tr><th>Tarikh</th><th>Peniaga</th><th>Kategori</th><th>Status</th><th className="align-right">Jumlah</th></tr></thead>
              <tbody>
                {recent.map((item) => (
                  <tr key={item.id}>
                    <td>{item.date}</td>
                    <td><strong>{item.merchant}</strong><small>{item.description}</small></td>
                    <td>{item.category}</td>
                    <td><span className={`status status-${item.status}`}>{item.status === "confirmed" ? "Disahkan" : "Semakan"}</span></td>
                    <td className={`align-right amount-${item.type}`}>{item.type === "income" ? "+" : "−"}{currency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <span aria-hidden="true"><ReceiptText size={22} strokeWidth={2} /></span>
            <h3>Tiada transaksi lagi</h3>
            <p>Imbas resit untuk mencipta transaksi pertama anda.</p>
            <Link className="primary-button link-button" href="/receipts">Imbas resit</Link>
          </div>
        )}
      </section>
    </main>
  );
}

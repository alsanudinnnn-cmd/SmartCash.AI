import Link from "next/link";
import { FileChartColumn } from "lucide-react";
import { PageHeader } from "@/app/components/PageHeader";
import { ReportActions } from "@/app/components/ReportActions";
import { getTransactions, summarizeTransactions } from "@/app/lib/data";
import { currency } from "@/app/lib/format";
import { requireUser } from "@/app/lib/auth";

const statementNames = {
  income: "Penyata Pendapatan",
  position: "Penyata Kedudukan Kewangan",
  cashflow: "Penyata Aliran Tunai",
  trial: "Imbangan Duga",
  ledger: "Lejar Am",
} as const;

type StatementKey = keyof typeof statementNames;

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ statement?: string }>;
}) {
  const user = await requireUser("/reports");
  const transactions = await getTransactions(user.id);
  const summary = summarizeTransactions(transactions);
  const requested = (await searchParams).statement;
  const active: StatementKey = requested && requested in statementNames
    ? requested as StatementKey
    : "income";
  const margin = summary.sales ? Math.round((summary.profit / summary.sales) * 100) : 0;

  return (
    <main className="app-content report-page">
      <PageHeader
        eyebrow="Penyata kewangan"
        title={statementNames[active]}
        description={`Laporan ${user.businessName} berdasarkan transaksi yang telah disahkan.`}
        action={<ReportActions />}
      />
      <section className="report-layout">
        <article className="panel statement">
          <div className="statement-heading">
            <span className="brand-mark" aria-hidden="true"><FileChartColumn size={21} strokeWidth={2.2} /></span>
            <div><strong>{user.businessName}</strong><span>{statementNames[active]} · Julai 2026</span></div>
          </div>
          <StatementContent
            active={active}
            expenses={summary.expenses}
            profit={summary.profit}
            sales={summary.sales}
            transactions={transactions}
          />
        </article>
        <aside className="report-sidebar">
          <article className="panel">
            <span className="page-eyebrow">Ringkasan</span>
            <h2>{margin}%</h2>
            <p>Margin keuntungan bersih berdasarkan rekod semasa.</p>
          </article>
          <article className="panel report-options">
            <h3>Pilih penyata</h3>
            {Object.entries(statementNames).map(([key, label]) => (
              <Link
                className={active === key ? "active" : ""}
                href={`/reports?statement=${key}`}
                key={key}
              >
                {label}
              </Link>
            ))}
          </article>
        </aside>
      </section>
    </main>
  );
}

function StatementContent({
  active,
  sales,
  expenses,
  profit,
  transactions,
}: {
  active: StatementKey;
  sales: number;
  expenses: number;
  profit: number;
  transactions: Awaited<ReturnType<typeof getTransactions>>;
}) {
  if (active === "position") {
    return (
      <>
        <StatementSection title="Aset" rows={[["Tunai dan bank", profit], ["Inventori / aset semasa", expenses * 0.35]]} totalLabel="Jumlah aset" total={profit + expenses * 0.35} />
        <StatementSection title="Liabiliti dan Ekuiti" rows={[["Liabiliti semasa", 0], ["Ekuiti pemilik", profit + expenses * 0.35]]} totalLabel="Jumlah liabiliti dan ekuiti" total={profit + expenses * 0.35} />
      </>
    );
  }
  if (active === "cashflow") {
    return (
      <>
        <StatementSection title="Aktiviti Operasi" rows={[["Penerimaan daripada jualan", sales], ["Bayaran perbelanjaan", -expenses]]} totalLabel="Tunai bersih daripada operasi" total={profit} />
        <div className="statement-profit"><span>Baki tunai akhir</span><strong>{currency(profit)}</strong></div>
      </>
    );
  }
  if (active === "trial") {
    return (
      <>
        <div className="statement-section">
          <h2>Baki Akaun</h2>
          <div className="statement-row"><span>Tunai / Bank — Debit</span><strong>{currency(profit)}</strong></div>
          <div className="statement-row"><span>Belanja — Debit</span><strong>{currency(expenses)}</strong></div>
          <div className="statement-row"><span>Hasil Jualan — Kredit</span><strong>{currency(sales)}</strong></div>
          <div className="statement-total"><span>Jumlah debit dan kredit</span><strong>{currency(sales)}</strong></div>
        </div>
      </>
    );
  }
  if (active === "ledger") {
    return (
      <div className="statement-section">
        <h2>Catatan Lejar</h2>
        {transactions.filter((item) => item.status === "confirmed").map((item) => (
          <div className="statement-row" key={item.id}>
            <span>{item.date} · {item.account} · {item.merchant}</span>
            <strong>{item.type === "income" ? "+" : "−"}{currency(item.amount)}</strong>
          </div>
        ))}
        <div className="statement-total"><span>Baki</span><strong>{currency(profit)}</strong></div>
      </div>
    );
  }
  return (
    <>
      <StatementSection title="Pendapatan" rows={[["Hasil jualan", sales]]} totalLabel="Jumlah pendapatan" total={sales} />
      <StatementSection
        title="Perbelanjaan"
        rows={transactions
          .filter((item) => item.type === "expense" && item.status === "confirmed")
          .map((item) => [`${item.category} · ${item.merchant}`, item.amount] as [string, number])}
        totalLabel="Jumlah perbelanjaan"
        total={expenses}
      />
      <div className="statement-profit"><span>Untung bersih</span><strong>{currency(profit)}</strong></div>
    </>
  );
}

function StatementSection({
  title,
  rows,
  totalLabel,
  total,
}: {
  title: string;
  rows: [string, number][];
  totalLabel: string;
  total: number;
}) {
  return (
    <div className="statement-section">
      <h2>{title}</h2>
      {rows.map(([label, value]) => (
        <div className="statement-row" key={label}><span>{label}</span><strong>{currency(value)}</strong></div>
      ))}
      <div className="statement-total"><span>{totalLabel}</span><strong>{currency(total)}</strong></div>
    </div>
  );
}

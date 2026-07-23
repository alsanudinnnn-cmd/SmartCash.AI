import Link from "next/link";
import { ReceiptText, Search } from "lucide-react";
import { PageHeader } from "@/app/components/PageHeader";
import { getTransactions } from "@/app/lib/data";
import { currency } from "@/app/lib/format";
import { requireUser } from "@/app/lib/auth";

export default async function TransactionsPage() {
  const user = await requireUser("/transactions");
  const transactions = await getTransactions(user.id);
  return (
    <main className="app-content">
      <PageHeader
        eyebrow="Rekod transaksi"
        title="Semua transaksi"
        description="Semak pendapatan dan perbelanjaan yang telah direkodkan."
        action={<Link className="primary-button link-button" href="/receipts">Tambah daripada resit</Link>}
      />
      <section className="panel table-panel">
        <div className="table-toolbar">
          <div className="search-field"><span aria-hidden="true"><Search size={17} strokeWidth={2} /></span><input aria-label="Cari transaksi" placeholder="Cari peniaga atau kategori" /></div>
          <span className="record-count">{transactions.length} rekod</span>
        </div>
        {transactions.length ? (
          <div className="responsive-table">
            <table>
              <thead><tr><th>Tarikh</th><th>Transaksi</th><th>Kategori</th><th>Kaedah</th><th>Status</th><th className="align-right">Jumlah</th></tr></thead>
              <tbody>
                {transactions.map((item) => (
                  <tr key={item.id}>
                    <td>{item.date}</td>
                    <td><strong>{item.merchant}</strong><small>{item.receiptNumber ?? item.description}</small></td>
                    <td><span className="category-pill">{item.category}</span></td>
                    <td>{item.paymentMethod}</td>
                    <td><span className={`status status-${item.status}`}>{item.status === "confirmed" ? "Disahkan" : "Semakan"}</span></td>
                    <td className={`align-right amount-${item.type}`}>{item.type === "income" ? "+" : "−"}{currency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="empty-state"><span aria-hidden="true"><ReceiptText size={22} strokeWidth={2} /></span><h3>Belum ada transaksi</h3><p>Rekod transaksi pertama anda melalui imbasan resit.</p></div>}
      </section>
    </main>
  );
}

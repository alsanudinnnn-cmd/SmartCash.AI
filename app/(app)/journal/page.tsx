import { PageHeader } from "@/app/components/PageHeader";
import { BookOpenText } from "lucide-react";
import { getTransactions } from "@/app/lib/data";
import { currency } from "@/app/lib/format";
import { requireUser } from "@/app/lib/auth";

export default async function JournalPage() {
  const user = await requireUser("/journal");
  const transactions = (await getTransactions(user.id)).filter((item) => item.status === "confirmed");
  return (
    <main className="app-content">
      <PageHeader
        eyebrow="Jurnal automatik"
        title="Jurnal Am"
        description="Catatan debit dan kredit dijana daripada setiap transaksi yang disahkan."
      />
      <section className="journal-list">
        {transactions.map((item) => {
          const net = item.type === "expense" ? item.amount - item.taxAmount : item.amount;
          return (
            <article className="panel journal-card" key={item.id}>
              <div className="journal-meta">
                <div><span>{item.date}</span><h2>{item.merchant}</h2><p>{item.receiptNumber ?? item.description}</p></div>
                <span className="balanced-pill">Seimbang</span>
              </div>
              <div className="responsive-table">
                <table>
                  <thead><tr><th>Akaun</th><th className="align-right">Debit (RM)</th><th className="align-right">Kredit (RM)</th></tr></thead>
                  <tbody>
                    <tr>
                      <td><strong>{item.type === "income" ? "Tunai / Bank" : item.account}</strong></td>
                      <td className="align-right">{currency(item.type === "income" ? item.amount : net)}</td>
                      <td className="align-right">—</td>
                    </tr>
                    {item.type === "expense" && item.taxAmount > 0 && (
                      <tr><td>SST dibayar</td><td className="align-right">{currency(item.taxAmount)}</td><td className="align-right">—</td></tr>
                    )}
                    <tr>
                      <td><strong>{item.type === "income" ? "Hasil Jualan" : item.paymentMethod}</strong></td>
                      <td className="align-right">—</td>
                      <td className="align-right">{currency(item.amount)}</td>
                    </tr>
                  </tbody>
                  <tfoot><tr><td>Jumlah</td><td className="align-right">{currency(item.amount)}</td><td className="align-right">{currency(item.amount)}</td></tr></tfoot>
                </table>
              </div>
            </article>
          );
        })}
        {!transactions.length && <div className="panel empty-state"><span aria-hidden="true"><BookOpenText size={22} strokeWidth={2} /></span><h3>Jurnal masih kosong</h3><p>Sahkan transaksi untuk menjana jurnal secara automatik.</p></div>}
      </section>
    </main>
  );
}

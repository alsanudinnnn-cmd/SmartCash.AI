"use client";

import { useMemo, useState } from "react";
import { ChevronDown, PackageSearch, Search } from "lucide-react";
import type { TransactionRecord } from "@/app/lib/data";
import { currency } from "@/app/lib/format";

export function JournalTransactions({ transactions }: { transactions: TransactionRecord[] }) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const filtered = useMemo(() => {
    const search = query.trim().toLocaleLowerCase("ms-MY");
    if (!search) return transactions;
    return transactions.filter((item) => [item.merchant, item.receiptNumber, item.description, item.category, ...item.items.map((entry) => entry.itemName)].filter(Boolean).some((value) => value!.toLocaleLowerCase("ms-MY").includes(search)));
  }, [query, transactions]);

  return (
    <section className="journal-list">
      <div className="journal-toolbar">
        <label className="search-field journal-search"><span aria-hidden="true"><Search size={17} /></span><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Cari sejarah transaksi" placeholder="Cari peniaga, kategori atau item" /></label>
        <span className="record-count">{filtered.length} rekod</span>
      </div>
      {filtered.map((item) => {
        const net = item.type === "expense" ? item.amount - item.taxAmount : item.amount;
        const expanded = item.id === selectedId;
        return (
          <article className={`panel journal-card ${expanded ? "is-expanded" : ""}`} key={item.id}>
            <button className="journal-toggle" onClick={() => setSelectedId(expanded ? null : item.id)} type="button" aria-expanded={expanded} aria-controls={`receipt-items-${item.id}`}>
              <span className="journal-meta"><span><span>{item.date}</span><h2>{item.merchant}</h2><p>{item.receiptNumber ?? item.description}</p></span><span className="balanced-pill">Seimbang</span></span>
              <ChevronDown className="journal-chevron" size={20} aria-hidden="true" />
            </button>
            <div className="responsive-table">
              <table><thead><tr><th>Akaun</th><th className="align-right">Debit (RM)</th><th className="align-right">Kredit (RM)</th></tr></thead><tbody>
                <tr><td><strong>{item.type === "income" ? "Tunai / Bank" : item.account}</strong></td><td className="align-right">{currency(item.type === "income" ? item.amount : net)}</td><td className="align-right">—</td></tr>
                {item.type === "expense" && item.taxAmount > 0 && <tr><td>SST dibayar</td><td className="align-right">{currency(item.taxAmount)}</td><td className="align-right">—</td></tr>}
                <tr><td><strong>{item.type === "income" ? "Hasil Jualan" : item.paymentMethod}</strong></td><td className="align-right">—</td><td className="align-right">{currency(item.amount)}</td></tr>
              </tbody><tfoot><tr><td>Jumlah</td><td className="align-right">{currency(item.amount)}</td><td className="align-right">{currency(item.amount)}</td></tr></tfoot></table>
            </div>
            {expanded && <div className="receipt-items" id={`receipt-items-${item.id}`}>
              <div><span className="receipt-items-icon" aria-hidden="true"><PackageSearch size={17} /></span><span><strong>Senarai barang dibeli</strong><small>Butiran yang dikesan daripada resit</small></span></div>
              {item.items.length ? <div className="responsive-table"><table><thead><tr><th>Item</th><th className="align-right">Kuantiti</th><th className="align-right">Harga/unit</th><th className="align-right">Jumlah</th></tr></thead><tbody>{item.items.map((entry) => <tr key={entry.id}><td>{entry.itemName}</td><td className="align-right">{entry.quantity}</td><td className="align-right">{currency(entry.unitPrice)}</td><td className="align-right"><strong>{currency(entry.total)}</strong></td></tr>)}</tbody></table></div> : <p className="receipt-items-empty">Tiada senarai item direkodkan untuk resit ini. Keterangan: {item.description}</p>}
            </div>}
          </article>
        );
      })}
      {!filtered.length && <div className="panel empty-state"><span aria-hidden="true"><PackageSearch size={22} /></span><h3>{transactions.length ? "Tiada rekod sepadan" : "Transaksi masih kosong"}</h3><p>{transactions.length ? "Cuba kata kunci lain untuk mencari sejarah anda." : "Sahkan resit untuk menjana catatan transaksi secara automatik."}</p></div>}
    </section>
  );
}

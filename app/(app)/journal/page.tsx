import { PageHeader } from "@/app/components/PageHeader";
import { JournalTransactions } from "@/app/components/JournalTransactions";
import { getTransactions } from "@/app/lib/data";
import { requireUser } from "@/app/lib/auth";

export default async function JournalPage() {
  const user = await requireUser("/journal");
  const transactions = (await getTransactions(user.id)).filter((item) => item.status === "confirmed");
  return <main className="app-content"><PageHeader eyebrow="Jurnal automatik" title="Transaksi" description="Sejarah transaksi dalam format jurnal automatik. Pilih resit untuk melihat senarai barang yang dibeli." /><JournalTransactions transactions={transactions} /></main>;
}

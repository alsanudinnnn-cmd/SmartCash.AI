import { PageHeader } from "@/app/components/PageHeader";
import { ReceiptWorkflow } from "@/app/components/ReceiptWorkflow";
import { ShieldCheck } from "lucide-react";

export default function ReceiptsPage() {
  return (
    <main className="app-content">
      <PageHeader
        eyebrow="Imbas resit"
        title="Tukar resit kepada rekod"
        description="Muat naik resit dan biarkan Google Gemini membaca peniaga, tarikh, jumlah, cukai dan kategori secara automatik."
      />
      <section className="panel upload-panel">
        <ReceiptWorkflow />
      </section>
      <aside className="privacy-note">
        <span aria-hidden="true"><ShieldCheck size={20} strokeWidth={2} /></span>
        <div><strong>Fail anda disimpan dengan selamat</strong><p>Resit disimpan dalam ruang cloud perniagaan anda dan hanya digunakan untuk menghasilkan rekod transaksi.</p></div>
      </aside>
    </main>
  );
}

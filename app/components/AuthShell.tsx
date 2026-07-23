import Link from "next/link";
import type { ReactNode } from "react";
import { WalletCards } from "lucide-react";

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <main className="auth-page">
      <section className="auth-brand-panel" aria-label="SmartCash AI">
        <Link className="brand auth-brand" href="/">
          <span className="brand-mark" aria-hidden="true"><WalletCards size={21} strokeWidth={2.2} /></span>
          <span>SmartCash <strong>AI</strong></span>
        </Link>
        <div className="auth-message">
          <span className="auth-kicker">Perakaunan berasaskan AI untuk PKS</span>
          <h1>Daripada resit kepada laporan, semuanya tersusun.</h1>
          <p>
            Rekod transaksi, jana jurnal dan fahami prestasi kewangan dalam
            satu ruang kerja yang mudah.
          </p>
        </div>
        <div className="auth-proof" aria-label="Ciri utama">
          <span><strong>10×</strong> proses lebih pantas</span>
          <span><strong>24/7</strong> akses data cloud</span>
        </div>
      </section>
      <section className="auth-form-panel">
        <div className="auth-form-wrap">
          <span className="form-eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
          <p className="form-description">{description}</p>
          {children}
          <div className="auth-footer">{footer}</div>
        </div>
      </section>
    </main>
  );
}

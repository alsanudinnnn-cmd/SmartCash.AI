"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CircleCheckBig,
  CloudUpload,
  PencilLine,
  Sparkles,
} from "lucide-react";
import { BUDGET_CATEGORIES } from "@/app/lib/budget-config";

type Analysis = {
  id: string;
  merchant: string;
  date: string;
  amount: number;
  taxAmount: number;
  paymentMethod: string;
  category: string;
  account: string;
  description: string;
  confidence: number;
  analysisSource: "gemini";
};

const PAYMENT_METHODS = ["Tunai", "Bank", "Kad", "E-dompet"];

export function ReceiptUploader() {
  const router = useRouter();
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  async function analyze(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const response = await fetch("/api/receipts", {
      method: "POST",
      body: new FormData(event.currentTarget),
    });
    const result = (await response.json()) as Analysis & { error?: string };
    if (!response.ok) {
      setError(result.error ?? "Resit tidak dapat dianalisis.");
      setBusy(false);
      return;
    }
    setAnalysis(result);
    setBusy(false);
  }

  async function confirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!analysis) return;
    setConfirming(true);
    setError("");

    const response = await fetch(`/api/transactions/${analysis.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        status: "confirmed",
        merchant: analysis.merchant,
        date: analysis.date,
        amount: analysis.amount,
        taxAmount: analysis.taxAmount,
        paymentMethod: analysis.paymentMethod,
        category: analysis.category,
        description: analysis.description,
      }),
    });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(result.error ?? "Transaksi tidak dapat disahkan. Sila cuba lagi.");
      setConfirming(false);
      return;
    }
    router.push("/transactions");
    router.refresh();
  }

  function updateAnalysis<K extends keyof Analysis>(key: K, value: Analysis[K]) {
    setAnalysis((current) => current ? { ...current, [key]: value } : current);
  }

  if (analysis) {
    return (
      <form className="analysis-review" onSubmit={confirm}>
        <div className="review-success" aria-live="polite">
          <span className="success-mark" aria-hidden="true">
            <CircleCheckBig size={20} strokeWidth={2.3} />
          </span>
          <div>
            <strong>Cadangan Gemini sudah tersedia</strong>
            <p>Semak setiap field dan betulkan mana-mana maklumat yang kurang tepat.</p>
          </div>
          <span className="confidence">
            <Sparkles size={13} aria-hidden="true" />
            {Math.round(analysis.confidence * 100)}% yakin
          </span>
        </div>

        <div className="ai-edit-heading">
          <span aria-hidden="true"><PencilLine size={18} /></span>
          <div>
            <strong>Maklumat yang dikesan</strong>
            <small>Semua cadangan di bawah boleh diedit sebelum disimpan.</small>
          </div>
        </div>

        <div className="receipt-fields ai-suggestion-fields">
          <label>
            <span>Nama peniaga <small className="ai-field-tag">Cadangan AI</small></span>
            <input
              name="merchant"
              value={analysis.merchant}
              onChange={(event) => updateAnalysis("merchant", event.target.value)}
              required
            />
          </label>
          <label>
            <span>Jumlah resit (RM) <small className="ai-field-tag">Cadangan AI</small></span>
            <input
              name="amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              value={analysis.amount}
              onChange={(event) => updateAnalysis("amount", Number(event.target.value))}
              required
            />
          </label>
          <label>
            <span>Tarikh <small className="ai-field-tag">Cadangan AI</small></span>
            <input
              name="date"
              type="date"
              value={analysis.date}
              onChange={(event) => updateAnalysis("date", event.target.value)}
              required
            />
          </label>
          <label>
            <span>Kaedah bayaran <small className="ai-field-tag">Cadangan AI</small></span>
            <select
              name="paymentMethod"
              value={analysis.paymentMethod}
              onChange={(event) => updateAnalysis("paymentMethod", event.target.value)}
              required
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method}>{method}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Kategori <small className="ai-field-tag">Cadangan AI</small></span>
            <select
              name="category"
              value={analysis.category}
              onChange={(event) => updateAnalysis("category", event.target.value)}
              required
            >
              {BUDGET_CATEGORIES.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Cukai pada resit (RM) <small className="ai-field-tag">Cadangan AI</small></span>
            <input
              name="taxAmount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              max={analysis.amount}
              value={analysis.taxAmount}
              onChange={(event) => updateAnalysis("taxAmount", Number(event.target.value))}
              required
            />
          </label>
          <label className="receipt-description-field">
            <span>Keterangan <small className="ai-field-tag">Cadangan AI</small></span>
            <textarea
              name="description"
              rows={3}
              maxLength={180}
              value={analysis.description}
              onChange={(event) => updateAnalysis("description", event.target.value)}
              required
            />
          </label>
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="review-actions">
          <button
            className="secondary-button"
            onClick={() => {
              setAnalysis(null);
              setError("");
            }}
            type="button"
          >
            Pilih resit lain
          </button>
          <button className="primary-button" disabled={confirming} type="submit">
            {confirming ? "Menyimpan…" : "Simpan transaksi"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <form className="receipt-form" onSubmit={analyze}>
      <label className="upload-zone">
        <input
          name="receipt"
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          required
          onChange={(event) => {
            const file = event.target.files?.[0];
            setFileName(file?.name ?? "");
            setError(
              file && file.size > 10 * 1024 * 1024
                ? "Saiz fail melebihi had 10 MB."
                : "",
            );
          }}
        />
        <span className="upload-symbol" aria-hidden="true">
          <CloudUpload size={24} strokeWidth={2} />
        </span>
        <strong>{fileName || "Pilih atau seret resit ke sini"}</strong>
        <small>JPG, PNG, WebP atau PDF · maksimum 10 MB</small>
        <span className="upload-button">Pilih fail</span>
      </label>
      <div className="receipt-fields">
        <label>
          <span>Nama peniaga <small>(pilihan)</small></span>
          <input name="merchant" placeholder="Gemini akan membaca resit" />
        </label>
        <label>
          <span>Jumlah resit (RM) <small>(pilihan)</small></span>
          <input
            name="amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            placeholder="Gemini akan mengira"
          />
        </label>
        <label>
          <span>Tarikh <small>(pilihan)</small></span>
          <input name="date" type="date" />
        </label>
        <label>
          <span>Kaedah bayaran <small>(pilihan)</small></span>
          <select name="paymentMethod" defaultValue="">
            <option value="">Automatik oleh Gemini</option>
            {PAYMENT_METHODS.map((method) => (
              <option key={method}>{method}</option>
            ))}
          </select>
        </label>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="primary-button analyze-button" disabled={busy} type="submit">
        {!busy && <Sparkles size={17} aria-hidden="true" />}
        {busy ? "Gemini sedang membaca resit…" : "Baca resit dengan Gemini"}
      </button>
    </form>
  );
}

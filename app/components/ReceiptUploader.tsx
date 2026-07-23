"use client";

import { ChangeEvent, DragEvent, FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CircleCheckBig,
  CloudUpload,
  Camera,
  FileUp,
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

export function ReceiptUploader({
  onStepChange,
}: {
  onStepChange: (step: number) => void;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [saved, setSaved] = useState(false);

  async function analyze(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedFile) {
      setError("Pilih fail atau ambil gambar resit terlebih dahulu.");
      return;
    }
    setBusy(true);
    setError("");
    onStepChange(2);
    const formData = new FormData(event.currentTarget);
    formData.set("receipt", selectedFile, selectedFile.name);
    const response = await fetch("/api/receipts", {
      method: "POST",
      body: formData,
    });
    const result = (await response.json()) as Analysis & { error?: string };
    if (!response.ok) {
      setError(result.error ?? "Resit tidak dapat dianalisis.");
      setBusy(false);
      onStepChange(1);
      return;
    }
    setAnalysis(result);
    setBusy(false);
    onStepChange(3);
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
    setSaved(true);
    onStepChange(3);
    window.setTimeout(() => {
      router.push("/journal");
      router.refresh();
    }, 1250);
  }

  function updateAnalysis<K extends keyof Analysis>(key: K, value: Analysis[K]) {
    setAnalysis((current) => current ? { ...current, [key]: value } : current);
  }

  function selectReceipt(file?: File) {
    if (!file) return;
    setSelectedFile(file);
    setFileName(file.name || `resit-${Date.now()}.jpg`);
    setError(file.size > 10 * 1024 * 1024 ? "Saiz fail melebihi had 10 MB." : "");
  }

  function handleFileInput(event: ChangeEvent<HTMLInputElement>) {
    selectReceipt(event.target.files?.[0]);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    selectReceipt(event.dataTransfer.files?.[0]);
  }

  function resetReceipt() {
    setAnalysis(null);
    setSelectedFile(null);
    setFileName("");
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    onStepChange(1);
  }

  if (saved) {
    return (
      <div className="receipt-save-success" aria-live="polite" role="status">
        <span className="receipt-save-check" aria-hidden="true"><CircleCheckBig size={44} strokeWidth={2.4} /></span>
        <h2>Resit berjaya disimpan</h2>
        <p>Rekod anda sedang ditambah ke halaman Transaksi.</p>
      </div>
    );
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
            onClick={resetReceipt}
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
      <div
        className="upload-zone"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          aria-label="Pilih fail resit"
          onChange={handleFileInput}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          aria-label="Ambil gambar resit menggunakan kamera"
          onChange={handleFileInput}
        />
        <span className="upload-symbol" aria-hidden="true">
          <CloudUpload size={24} strokeWidth={2} />
        </span>
        <strong>{fileName || "Pilih fail, seret atau ambil gambar resit"}</strong>
        <small>JPG, PNG, WebP atau PDF · maksimum 10 MB</small>
        <div className="upload-actions">
          <button
            className="upload-button"
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileUp size={16} aria-hidden="true" />
            Pilih fail
          </button>
          <button
            className="upload-button camera-button"
            type="button"
            onClick={() => cameraInputRef.current?.click()}
          >
            <Camera size={16} aria-hidden="true" />
            Buka kamera
          </button>
        </div>
      </div>
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
      <button
        className="primary-button analyze-button"
        disabled={busy || !selectedFile || Boolean(error)}
        type="submit"
      >
        {!busy && <Sparkles size={17} aria-hidden="true" />}
        {busy ? "Gemini sedang membaca resit…" : "Baca resit dengan Gemini"}
      </button>
    </form>
  );
}

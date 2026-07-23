"use client";

import { FormEvent, useRef, useState } from "react";
import { MailCheck, RotateCw } from "lucide-react";
import { useRouter } from "next/navigation";

export function RegisterForm() {
  const router = useRouter();
  const codeRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [verificationStage, setVerificationStage] = useState(false);
  const [registrationData, setRegistrationData] = useState<Record<string, string> | null>(null);

  async function sendCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await requestCode(Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<string, string>);
  }

  async function requestCode(details: Record<string, string>) {
    setError("");
    setMessage("");
    setBusy(true);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(details),
    });
    const result = await response.json() as { error?: string; email?: string };
    setBusy(false);
    if (!response.ok) {
      setError(result.error ?? "Kod pengesahan tidak dapat dihantar.");
      return;
    }
    setRegistrationData(details);
    setEmail(result.email ?? details.email ?? "");
    setVerificationStage(true);
    setMessage("Kod 6 digit telah dihantar. Semak juga folder spam anda.");
    window.setTimeout(() => codeRef.current?.focus(), 0);
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const code = String(form.get("verificationCode") ?? "");
    setError("");
    setMessage("");
    setBusy(true);
    const response = await fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    const result = await response.json() as { error?: string };
    if (!response.ok) {
      setError(result.error ?? "Kod pengesahan tidak dapat disahkan.");
      setBusy(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form className="auth-form register-form" onSubmit={verificationStage ? verifyCode : sendCode}>
      <fieldset disabled={verificationStage}>
        <div className="form-grid">
          <label><span>Nama penuh</span><input name="fullName" autoComplete="name" placeholder="Nur Shazween" required /></label>
          <label><span>No. telefon</span><input name="phone" type="tel" autoComplete="tel" placeholder="012-3456789" /></label>
        </div>
        <label><span>E-mel</span><input name="email" type="email" autoComplete="email" placeholder="nama@perniagaan.com" required /></label>
        <div className="form-grid">
          <label><span>Nama perniagaan</span><input name="businessName" autoComplete="organization" placeholder="Shazween Enterprise" required /></label>
          <label><span>Jenis perniagaan</span><select name="businessType" required defaultValue=""><option value="" disabled>Pilih jenis</option><option>Kedai Runcit</option><option>Perkhidmatan</option><option>Makanan & Minuman</option><option>E-dagang</option><option>Lain-lain</option></select></label>
        </div>
        <label><span>Kata laluan</span><input name="password" type="password" autoComplete="new-password" placeholder="Minimum 8 aksara" minLength={8} required /></label>
      </fieldset>

      {verificationStage && <div className="verification-box" aria-live="polite">
        <span className="verification-icon" aria-hidden="true"><MailCheck size={20} /></span>
        <div><strong>Sahkan e-mel anda</strong><p>Kami menghantar kod ke <b>{email}</b>.</p></div>
        <label className="verification-code"><span>Kod pengesahan 6 digit</span><input ref={codeRef} name="verificationCode" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} placeholder="000000" required /></label>
      </div>}
      {message && <p className="form-success" role="status">{message}</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      {verificationStage ? <div className="verification-actions"><button className="secondary-button" disabled={busy} onClick={() => { setVerificationStage(false); setMessage(""); setError(""); }} type="button">Ubah maklumat</button><button className="primary-button" disabled={busy} type="submit">{busy ? "Mengesahkan…" : "Sahkan & daftar"}</button></div> : <button className="primary-button" disabled={busy} type="submit">{busy ? "Menghantar kod…" : "Hantar kod verifikasi"}</button>}
      {verificationStage && <button className="resend-code" disabled={busy} onClick={() => registrationData && requestCode(registrationData)} type="button"><RotateCw size={14} aria-hidden="true" /> Hantar semula kod</button>}
    </form>
  );
}

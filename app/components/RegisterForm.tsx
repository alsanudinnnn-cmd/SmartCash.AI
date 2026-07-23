"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form)),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error);
      setBusy(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form className="auth-form register-form" onSubmit={submit}>
      <div className="form-grid">
        <label>
          <span>Nama penuh</span>
          <input name="fullName" autoComplete="name" placeholder="Nur Shazween" required />
        </label>
        <label>
          <span>No. telefon</span>
          <input name="phone" type="tel" autoComplete="tel" placeholder="012-3456789" />
        </label>
      </div>
      <label>
        <span>E-mel</span>
        <input name="email" type="email" autoComplete="email" placeholder="nama@perniagaan.com" required />
      </label>
      <div className="form-grid">
        <label>
          <span>Nama perniagaan</span>
          <input name="businessName" autoComplete="organization" placeholder="Shazween Enterprise" required />
        </label>
        <label>
          <span>Jenis perniagaan</span>
          <select name="businessType" required defaultValue="">
            <option value="" disabled>Pilih jenis</option>
            <option>Kedai Runcit</option>
            <option>Perkhidmatan</option>
            <option>Makanan & Minuman</option>
            <option>E-dagang</option>
            <option>Lain-lain</option>
          </select>
        </label>
      </div>
      <label>
        <span>Kata laluan</span>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Minimum 8 aksara"
          minLength={8}
          required
        />
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="primary-button" disabled={busy} type="submit">
        {busy ? "Mencipta akaun…" : "Daftar akaun"}
      </button>
    </form>
  );
}

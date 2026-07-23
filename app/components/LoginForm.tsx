"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<"login" | "demo" | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy("login");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error);
      setBusy(null);
      return;
    }
    router.push(params.get("returnTo") || "/dashboard");
    router.refresh();
  }

  async function useDemo() {
    setError("");
    setBusy("demo");
    const response = await fetch("/api/auth/demo", { method: "POST" });
    if (!response.ok) {
      setError("Akaun demo tidak dapat disediakan. Sila cuba lagi.");
      setBusy(null);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <>
      <form className="auth-form" onSubmit={submit}>
        <label>
          <span>E-mel</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="nama@perniagaan.com"
            required
          />
        </label>
        <label>
          <span>Kata laluan</span>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Masukkan kata laluan"
            minLength={8}
            required
          />
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="primary-button" disabled={busy !== null} type="submit">
          {busy === "login" ? "Sedang log masuk…" : "Log masuk"}
        </button>
      </form>
      <div className="form-divider"><span>atau</span></div>
      <button
        className="secondary-button"
        disabled={busy !== null}
        onClick={useDemo}
        type="button"
      >
        {busy === "demo" ? "Menyediakan demo…" : "Cuba akaun demo"}
      </button>
    </>
  );
}

import { getBindings } from "@/db";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export async function sendVerificationEmail(email: string, code: string) {
  const { RESEND_API_KEY, RESEND_FROM_EMAIL } = getBindings();
  if (!RESEND_API_KEY || !RESEND_FROM_EMAIL) {
    throw new Error("EMAIL_NOT_CONFIGURED");
  }

  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: RESEND_FROM_EMAIL,
      to: [email],
      subject: "Kod pengesahan SmartCash AI",
      text: `Kod pengesahan SmartCash AI anda ialah ${code}. Kod ini tamat dalam 10 minit. Jangan kongsi kod ini dengan sesiapa.`,
      html: `<div style="font-family:Inter,Arial,sans-serif;color:#0F172A;max-width:480px;margin:auto;padding:28px"><h1 style="font-size:22px">Sahkan e-mel anda</h1><p>Gunakan kod ini untuk melengkapkan pendaftaran SmartCash AI:</p><p style="margin:24px 0;padding:16px;border-radius:10px;background:#EEF2FF;color:#4338CA;font-size:30px;font-weight:800;letter-spacing:7px;text-align:center">${code}</p><p style="color:#475569;font-size:14px">Kod ini tamat dalam 10 minit. Jangan kongsi kod ini dengan sesiapa.</p></div>`,
    }),
  });

  if (!response.ok) {
    console.error("Resend verification email failed", response.status);
    throw new Error("EMAIL_SEND_FAILED");
  }
}

export async function hashVerificationCode(email: string, code: string) {
  const value = new TextEncoder().encode(`${email}:${code}`);
  const digest = await crypto.subtle.digest("SHA-256", value);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function generateVerificationCode() {
  const bytes = crypto.getRandomValues(new Uint32Array(1));
  return String(100_000 + (bytes[0] % 900_000));
}

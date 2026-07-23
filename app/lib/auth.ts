import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ensureSchema, getBindings } from "@/db";

export type AppUser = {
  id: string;
  fullName: string;
  email: string;
  businessName: string;
  businessType: string;
};

const SESSION_COOKIE = "smartcash_session";
const SESSION_AGE_SECONDS = 60 * 60 * 24 * 30;

export async function hashPassword(password: string, salt?: string) {
  const actualSalt = salt ?? bytesToBase64(crypto.getRandomValues(new Uint8Array(16)));
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const derived = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: base64ToBytes(actualSalt),
      iterations: 120_000,
      hash: "SHA-256",
    },
    material,
    256,
  );
  return { hash: bytesToBase64(new Uint8Array(derived)), salt: actualSalt };
}

export async function verifyPassword(password: string, salt: string, expected: string) {
  const { hash } = await hashPassword(password, salt);
  return timingSafeEqual(hash, expected);
}

export async function createSession(userId: string) {
  await ensureSchema();
  const sessionId = crypto.randomUUID();
  const now = Date.now();
  const expiresAt = now + SESSION_AGE_SECONDS * 1000;
  await getBindings().DB.prepare(
    "INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)",
  )
    .bind(sessionId, userId, expiresAt, now)
    .run();

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_AGE_SECONDS,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (sessionId) {
    await ensureSchema();
    await getBindings().DB.prepare("DELETE FROM sessions WHERE id = ?")
      .bind(sessionId)
      .run();
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<AppUser | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  await ensureSchema();
  const row = await getBindings().DB.prepare(
    `SELECT u.id, u.full_name, u.email, u.business_name, u.business_type
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.id = ? AND s.expires_at > ?`,
  )
    .bind(sessionId, Date.now())
    .first<{
      id: string;
      full_name: string;
      email: string;
      business_name: string;
      business_type: string;
    }>();

  if (!row) return null;
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    businessName: row.business_name,
    businessType: row.business_type,
  };
}

export async function requireUser(returnTo = "/dashboard") {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  return user;
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(value: string) {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function timingSafeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return mismatch === 0;
}

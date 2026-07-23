import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("includes the complete SmartCash application routes", async () => {
  const [login, register, dashboard, receipts, budget, journal, reports, analysis] =
    await Promise.all([
      readFile(new URL("../app/login/page.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/register/page.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/(app)/dashboard/page.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/(app)/receipts/page.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/(app)/budget/page.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/(app)/journal/page.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/(app)/reports/page.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/(app)/analysis/page.tsx", import.meta.url), "utf8"),
    ]);

  assert.match(login, /LoginForm/);
  assert.match(register, /RegisterForm/);
  assert.match(dashboard, /Aliran tunai/);
  assert.match(dashboard, /getCashFlowSeries/);
  assert.doesNotMatch(dashboard, /\[38, 52, 47, 67, 59, 82\]/);
  assert.match(receipts, /ReceiptUploader/);
  assert.match(budget, /BudgetManager/);
  assert.match(journal, /Jurnal Am/);
  assert.match(reports, /Penyata Pendapatan/);
  assert.match(analysis, /Analisis AI/);
});

test("produces a deployable build and persistent data migration", async () => {
  await Promise.all([
    access(new URL("../dist/server/index.js", import.meta.url)),
    access(new URL("../drizzle/0000_natural_hex.sql", import.meta.url)),
  ]);
  const hosting = JSON.parse(
    await readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
  );
  assert.equal(hosting.d1, "DB");
  assert.equal(hosting.r2, "RECEIPTS");
});

test("keeps Gemini receipt analysis on the server", async () => {
  const [analyzer, route, uploader] = await Promise.all([
    readFile(new URL("../app/lib/gemini-receipt.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/receipts/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/components/ReceiptUploader.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(analyzer, /generativelanguage\.googleapis\.com/);
  assert.match(analyzer, /gemini-3\.6-flash/);
  assert.match(analyzer, /responseMimeType: "application\/json"/);
  assert.match(route, /GEMINI_API_KEY/);
  assert.match(uploader, /Baca resit dengan Gemini/);
  assert.match(uploader, /Semua cadangan di bawah boleh diedit/);
  assert.match(uploader, /Simpan transaksi/);
  assert.doesNotMatch(uploader, /GEMINI_API_KEY/);
});

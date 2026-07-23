"use client";

import {
  CircleDollarSign,
  Gauge,
  PiggyBank,
  Plus,
  WalletCards,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import {
  BUDGET_CATEGORIES,
  type BudgetRecord,
  type SpendingByCategory,
} from "@/app/lib/budget-config";
import { currency } from "@/app/lib/format";

export function BudgetManager({
  month,
  initialBudgets,
  spendingByCategory,
}: {
  month: string;
  initialBudgets: BudgetRecord[];
  spendingByCategory: SpendingByCategory;
}) {
  const router = useRouter();
  const [category, setCategory] = useState(BUDGET_CATEGORIES[0]);
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const totals = useMemo(() => {
    const budget = initialBudgets.reduce((sum, item) => sum + item.amount, 0);
    const spent = initialBudgets.reduce(
      (sum, item) => sum + (spendingByCategory[item.category] ?? 0),
      0,
    );
    return { budget, spent, remaining: budget - spent };
  }, [initialBudgets, spendingByCategory]);

  async function saveBudget(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const response = await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month, category, amount: Number(amount) }),
    });
    const result = (await response.json()) as { error?: string };

    if (!response.ok) {
      setMessage({ type: "error", text: result.error ?? "Bajet tidak dapat disimpan." });
      setSaving(false);
      return;
    }

    setAmount("");
    setMessage({ type: "success", text: `Bajet ${category} berjaya disimpan.` });
    setSaving(false);
    router.refresh();
  }

  return (
    <>
      <section className="budget-summary-grid" aria-label="Ringkasan bajet">
        <article className="budget-summary-card">
          <span className="budget-summary-icon primary-budget-icon" aria-hidden="true">
            <PiggyBank size={21} />
          </span>
          <span>Jumlah bajet</span>
          <strong>{currency(totals.budget)}</strong>
          <small>{initialBudgets.length} kategori dirancang</small>
        </article>
        <article className="budget-summary-card">
          <span className="budget-summary-icon secondary-budget-icon" aria-hidden="true">
            <CircleDollarSign size={21} />
          </span>
          <span>Telah digunakan</span>
          <strong>{currency(totals.spent)}</strong>
          <small>Transaksi disahkan bulan ini</small>
        </article>
        <article className="budget-summary-card">
          <span className={`budget-summary-icon ${totals.remaining < 0 ? "danger-budget-icon" : "success-budget-icon"}`} aria-hidden="true">
            <WalletCards size={21} />
          </span>
          <span>Baki bajet</span>
          <strong className={totals.remaining < 0 ? "budget-negative" : ""}>
            {currency(totals.remaining)}
          </strong>
          <small>{totals.remaining < 0 ? "Melebihi perancangan" : "Masih tersedia"}</small>
        </article>
      </section>

      <div className="budget-layout">
        <section className="panel budget-form-panel">
          <div className="panel-header">
            <div>
              <h2>Tetapkan bajet</h2>
              <p>Masukkan had perbelanjaan untuk satu kategori.</p>
            </div>
            <span className="budget-heading-icon" aria-hidden="true"><Plus size={18} /></span>
          </div>
          <form className="budget-form" onSubmit={saveBudget}>
            <label>
              <span>Bulan bajet</span>
              <input
                aria-label="Bulan bajet"
                type="month"
                value={month}
                onChange={(event) => router.push(`/budget?month=${event.target.value}`)}
              />
            </label>
            <label>
              <span>Kategori</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value as typeof category)}
              >
                {BUDGET_CATEGORIES.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Jumlah bajet (RM)</span>
              <input
                inputMode="decimal"
                min="0.01"
                max="100000000"
                step="0.01"
                type="number"
                placeholder="Contoh: 1500"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
              />
            </label>
            {message && (
              <p className={message.type === "error" ? "form-error" : "form-success"} role="status">
                {message.text}
              </p>
            )}
            <button className="primary-button" disabled={saving} type="submit">
              {!saving && <Plus size={17} aria-hidden="true" />}
              {saving ? "Menyimpan…" : "Simpan bajet"}
            </button>
          </form>
        </section>

        <section className="panel budget-list-panel">
          <div className="panel-header">
            <div>
              <h2>Penggunaan mengikut kategori</h2>
              <p>Bandingkan perbelanjaan sebenar dengan jumlah yang dirancang.</p>
            </div>
            <span className="budget-heading-icon budget-gauge-icon" aria-hidden="true">
              <Gauge size={18} />
            </span>
          </div>
          {initialBudgets.length ? (
            <div className="budget-list">
              {initialBudgets.map((item) => {
                const spent = spendingByCategory[item.category] ?? 0;
                const percentage = item.amount > 0 ? (spent / item.amount) * 100 : 0;
                const cappedPercentage = Math.min(percentage, 100);
                const overBudget = spent > item.amount;
                return (
                  <article className="budget-row" key={item.id}>
                    <div className="budget-row-heading">
                      <div>
                        <strong>{item.category}</strong>
                        <small>{currency(spent)} daripada {currency(item.amount)}</small>
                      </div>
                      <span className={overBudget ? "budget-status budget-over" : "budget-status"}>
                        {overBudget
                          ? `${currency(spent - item.amount)} lebih`
                          : `${currency(item.amount - spent)} baki`}
                      </span>
                    </div>
                    <div
                      className="budget-progress-track"
                      role="progressbar"
                      aria-label={`Penggunaan bajet ${item.category}`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(cappedPercentage)}
                    >
                      <span
                        className={`budget-progress-fill ${overBudget ? "is-over" : ""}`}
                        style={{ width: `${cappedPercentage}%` }}
                      />
                    </div>
                    <span className="budget-percentage">{Math.round(percentage)}% digunakan</span>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-state budget-empty-state">
              <span aria-hidden="true"><PiggyBank size={23} /></span>
              <h3>Belum ada bajet untuk bulan ini</h3>
              <p>Pilih kategori dan masukkan jumlah untuk mula merancang.</p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

"use client";

import { useState } from "react";
import type { CashFlowGranularity, CashFlowPeriod } from "@/app/lib/data";
import { currency } from "@/app/lib/format";

const VIEWS: Array<{ key: CashFlowGranularity; label: string }> = [
  { key: "day", label: "Hari" },
  { key: "week", label: "Minggu" },
  { key: "month", label: "Bulan" },
];

export function CashFlowChart({ seriesByView }: { seriesByView: Record<CashFlowGranularity, CashFlowPeriod[]> }) {
  const [view, setView] = useState<CashFlowGranularity>("month");
  const series = seriesByView[view];
  const maximum = Math.max(1, ...series.flatMap((period) => [period.sales, period.expenses]));
  const description = series.map((period) => `${period.label}: bajet jualan ${currency(period.sales)}, perbelanjaan ${currency(period.expenses)}`).join("; ");

  return (
    <>
      <div className="chart-view-toggle" role="tablist" aria-label="Tempoh graf aliran tunai">
        {VIEWS.map((item) => (
          <button
            aria-selected={view === item.key}
            className={view === item.key ? "active" : ""}
            key={item.key}
            onClick={() => setView(item.key)}
            role="tab"
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="cash-chart" role="img" aria-label={`Graf aliran tunai mengikut ${VIEWS.find((item) => item.key === view)?.label.toLowerCase()}. ${description}`}>
        {series.map((period) => (
          <div className="chart-column" key={period.key}>
            <span className="bar-income" title={`${period.label} · Bajet jualan ${currency(period.sales)}`} style={{ height: period.sales ? `${Math.max(4, (period.sales / maximum) * 100)}%` : 0 }} />
            <span className="bar-expense" title={`${period.label} · Perbelanjaan ${currency(period.expenses)}`} style={{ height: period.expenses ? `${Math.max(4, (period.expenses / maximum) * 100)}%` : 0 }} />
          </div>
        ))}
      </div>
      <div className="chart-axis" aria-hidden="true">{series.map((period) => <span key={period.key}>{period.label}</span>)}</div>
      <div className="chart-legend"><span><i className="legend-income" /> Bajet jualan</span><span><i className="legend-expense" /> Perbelanjaan</span></div>
    </>
  );
}

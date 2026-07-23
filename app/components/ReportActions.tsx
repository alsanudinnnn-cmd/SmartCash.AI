"use client";

export function ReportActions() {
  return (
    <div className="report-actions">
      <button className="secondary-button" onClick={() => window.print()} type="button">Cetak / PDF</button>
      <a className="secondary-button link-button" href="/api/reports/export?format=excel">Excel</a>
      <a className="primary-button link-button" href="/api/reports/export?format=csv">CSV</a>
    </div>
  );
}

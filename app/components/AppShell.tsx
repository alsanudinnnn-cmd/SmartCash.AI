"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";
import {
  BookOpenText,
  FileChartColumn,
  LayoutDashboard,
  LogOut,
  PiggyBank,
  ScanLine,
  Sparkles,
  Store,
  WalletCards,
  X,
} from "lucide-react";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/receipts", label: "Imbas Resit", icon: ScanLine },
  { href: "/budget", label: "Bajet", icon: PiggyBank },
  { href: "/journal", label: "Transaksi", icon: BookOpenText },
  { href: "/reports", label: "Penyata Kewangan", icon: FileChartColumn },
  { href: "/analysis", label: "Analisis AI", icon: Sparkles },
];

export function AppShell({
  user,
  children,
}: {
  user: { fullName: string; businessName: string };
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="app-frame">
      {open && (
        <button
          className="sidebar-scrim"
          aria-label="Tutup menu"
          onClick={() => setOpen(false)}
          type="button"
        />
      )}
      <aside className={`app-sidebar ${open ? "is-open" : ""}`}>
        <div className="sidebar-brand">
          <Link className="brand" href="/dashboard" onClick={() => setOpen(false)}>
            <span className="brand-mark" aria-hidden="true"><WalletCards size={21} strokeWidth={2.2} /></span>
            <span>SmartCash <strong>AI</strong></span>
          </Link>
          <button
            className="mobile-close"
            aria-label="Tutup menu"
            onClick={() => setOpen(false)}
            type="button"
          >
            <X size={22} aria-hidden="true" />
          </button>
        </div>
        <div className="business-chip">
          <span className="business-avatar" aria-hidden="true">
            <Store size={18} strokeWidth={2.2} />
          </span>
          <span><small>Perniagaan</small><strong>{user.businessName}</strong></span>
        </div>
        <nav className="app-nav" aria-label="Navigasi aplikasi">
          <span className="nav-section-label">Menu utama</span>
          {navigation.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={active ? "active" : ""}
                href={item.href}
                key={item.href}
                onClick={() => setOpen(false)}
              >
                <span className="nav-icon" aria-hidden="true">
                  <item.icon size={17} strokeWidth={2} />
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="user-summary">
            <span className="user-avatar" aria-hidden="true">
              {user.fullName.split(" ").map((name) => name[0]).slice(0, 2).join("")}
            </span>
            <span><strong>{user.fullName}</strong><small>Pemilik akaun</small></span>
          </div>
          <button className="logout-button" onClick={logout} disabled={loggingOut} type="button">
            {!loggingOut && <LogOut size={15} aria-hidden="true" />}
            {loggingOut ? "Keluar…" : "Log keluar"}
          </button>
        </div>
      </aside>
      <div className="app-main">
        <header className="mobile-app-header">
          <button
            className="menu-button"
            aria-label="Buka menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
            type="button"
          >
            <span /><span /><span />
          </button>
          <Link className="mobile-brand" href="/dashboard">
            SmartCash <strong>AI</strong>
          </Link>
          <span className="mobile-avatar">{user.fullName[0]}</span>
        </header>
        {children}
      </div>
    </div>
  );
}

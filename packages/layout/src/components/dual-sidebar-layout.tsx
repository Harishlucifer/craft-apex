"use client";

import { useState } from "react";
import { PanelLeft, X } from "lucide-react";
import Link from "next/link";
import { cn } from "../lib/utils";
import { SidebarMenuItem } from "./sidebar-menu-item";
import type { LayoutConfig, MenuItem } from "../types";

/* ------------------------------------------------------------------ */
/*  Dual sidebar layout                                                 */
/*                                                                      */
/*  ┌────────────────────────────────────────────────────────────────┐  */
/*  │  HEADER                                                        │  */
/*  ├──────┬─────────────┬──────────────────────────────────────────┤  */
/*  │ Rail │  Secondary  │        MAIN CONTENT                      │  */
/*  ├──────┴─────────────┴──────────────────────────────────────────┤  */
/*  │  FOOTER                                                        │  */
/*  └────────────────────────────────────────────────────────────────┘  */
/* ------------------------------------------------------------------ */

interface DualSidebarLayoutProps {
  config: LayoutConfig;
  children: React.ReactNode;
}

export function DualSidebarLayout({
  config,
  children,
}: DualSidebarLayoutProps) {
  const railItems = config.railItems ?? [];
  const [activeRail, setActiveRail] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeRailItem = railItems.find((r) => r.id === activeRail);
  const hasSecondary =
    activeRailItem?.children && activeRailItem.children.length > 0;

  const handleRailClick = (id: string) => {
    setActiveRail((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* ═══════════════════════ HEADER ═══════════════════════════════ */}
      {config.header && (
        <header className="z-30 flex h-[52px] shrink-0 items-center border-b border-border bg-white shadow-sm">
          {config.header}
        </header>
      )}

      {/* ═══════════════════════ BODY ═══════════════════════════════ */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Mobile overlay ── */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* ── Icon Rail ── */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-[62px] flex-col items-center bg-gradient-to-b from-slate-50 to-white border-r border-slate-200/80 transition-transform duration-300 lg:relative lg:z-20",
            config.header ? "top-[52px] lg:top-0" : "top-0",
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          )}
        >
          {/* Brand icon */}
          {config.brand?.icon && (
            <div className="flex h-12 w-full items-center justify-center">
              <span className="flex h-8 w-8 items-center justify-center">
                {config.brand.icon}
              </span>
            </div>
          )}

          {/* Rail navigation */}
          <nav className="flex flex-1 flex-col items-center gap-[2px] overflow-y-auto py-1 px-1 scrollbar-thin">
            {railItems.map((item) => (
              <RailButton
                key={item.id}
                item={item}
                isActive={activeRail === item.id}
                onClick={() => handleRailClick(item.id)}
              />
            ))}
          </nav>
        </aside>

        {/* ── Secondary sidebar ── */}
        <aside
          className={cn(
            "fixed z-40 flex w-[230px] flex-col bg-white border-r border-slate-200/80 shadow-lg transition-all duration-300 ease-in-out lg:relative lg:z-10 lg:shadow-none",
            config.header
              ? "inset-y-0 top-[52px] lg:top-0"
              : "inset-y-0 top-0",
            mobileOpen ? "left-[62px]" : "left-0 lg:left-0",
            hasSecondary ? "translate-x-0 lg:ml-0 opacity-100" : "-translate-x-full lg:-ml-[230px] opacity-0 lg:opacity-100"
          )}
        >
          {/* Section header */}
          <div className="flex h-12 items-center justify-between border-b border-slate-100 px-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-primary">
                {activeRailItem?.icon}
              </span>
              <span className="text-sm font-semibold text-slate-800">
                {activeRailItem?.label ?? "Menu"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveRail(null)}
              className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Menu items */}
          <nav className="flex-1 overflow-y-auto px-2 py-2 scrollbar-thin">
            <ul className="space-y-0.5 text-left">
              {activeRailItem?.children?.map((item) => (
                <SidebarMenuItem key={item.id} item={item} />
              ))}
            </ul>
          </nav>
        </aside>

        {/* ── Main content ── */}
        <main className="flex flex-1 flex-col overflow-hidden bg-slate-50/50">
          {/* Mobile toggle */}
          <div className="flex h-11 shrink-0 items-center gap-2 border-b border-border bg-white px-4 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              aria-label="Open sidebar"
            >
              <PanelLeft className="h-5 w-5" />
            </button>
            {config.brand && (
              <span className="text-sm font-semibold">
                {config.brand.title}
              </span>
            )}
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">{children}</div>
        </main>
      </div>

      {/* ═══════════════════════ FOOTER ═══════════════════════════════ */}
      {config.footer && (
        <footer className="z-30 shrink-0 border-t border-slate-200/80 bg-white px-4 py-2">
          {config.footer}
        </footer>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Rail button – icon + label, vertical stack                         */
/* ------------------------------------------------------------------ */

function RailButton({
  item,
  isActive,
  onClick,
}: {
  item: MenuItem;
  isActive: boolean;
  onClick: () => void;
}) {
  const hasChildren = item.children && item.children.length > 0;

  const inner = (
    <>
      <span
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-lg transition-all",
          isActive
            ? "text-white shadow-sm"
            : "text-slate-500 group-hover:text-[#2d5483]"
        )}
        style={isActive ? { backgroundColor: "#2d5483" } : undefined}
      >
        {item.icon ?? (
          <span className="text-[11px] font-bold">{item.label[0]}</span>
        )}
      </span>
      <span
        className={cn(
          "text-[10px] font-medium leading-tight text-center line-clamp-1 transition-colors",
          isActive ? "font-semibold" : "text-slate-500 group-hover:text-slate-700"
        )}
        style={isActive ? { color: "#2d5483" } : undefined}
      >
        {item.label}
      </span>
    </>
  );

  const classes = cn(
    "group flex w-full flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 transition-all cursor-pointer",
    "hover:bg-slate-100"
  );
  const activeStyle = isActive ? { backgroundColor: "rgba(45, 84, 131, 0.08)" } : undefined;

  if (!hasChildren && item.href) {
    return (
      <Link href={item.href} className={classes} style={activeStyle} title={item.label}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} title={item.label} className={classes} style={activeStyle}>
      {inner}
    </button>
  );
}
